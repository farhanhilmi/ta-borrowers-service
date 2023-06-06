import borrowerModels from '../database/models/borrower.models.js';
import relativesModels from '../database/models/relatives.models.js';
import workModels from '../database/models/work.models.js';
import {
    ActiveLoanError,
    AuthorizeError,
    NotFoundError,
    RequestError,
    ValidationError,
} from '../utils/errorHandler.js';
import {
    omit,
    toObjectId,
    transformNestedObject,
    validateRequestPayload,
} from '../utils/index.js';
import connection from '../database/connection.js';
import { uploadFileToFirebase } from '../utils/firebase.js';

const validateRequest = (payload, personal, relativesContact) => {
    let errors = validateRequestPayload(payload, [
        'personal',
        'relativesContact',
    ]);

    if (errors.length > 0) {
        throw new ValidationError(`${errors} field(s) are required!`);
    }

    errors = validateRequestPayload(personal, [
        'fullName',
        'gender',
        'birthDate',
        'work',
    ]);

    if (errors.length > 0) {
        throw new ValidationError(
            `${errors} field(s) in personal are required!`,
        );
    }

    errors = validateRequestPayload(personal.work, ['name', 'salary']);

    if (errors.length > 0) {
        throw new ValidationError(
            `${errors} field(s) in personal.work are required!`,
        );
    }

    errors = validateRequestPayload(relativesContact, [
        'firstRelative',
        'secondRelative',
    ]);

    if (errors.length > 0) {
        throw new ValidationError(
            `${errors} field(s) in relativesContact are required!`,
        );
    }

    errors = validateRequestPayload(relativesContact.firstRelative, [
        'name',
        'relation',
        'phoneNumber',
    ]);

    if (errors.length > 0) {
        throw new ValidationError(
            `${errors} field(s) in relativesContact.firstRelative are required!`,
        );
    }

    errors = validateRequestPayload(relativesContact.secondRelative, [
        'name',
        'relation',
        'phoneNumber',
    ]);

    if (errors.length > 0) {
        throw new ValidationError(
            `${errors} field(s) in relativesContact.secondRelative are required!`,
        );
    }
};
export default class BorrowerService {
    constructor() {
        this.borrowerModels = borrowerModels;
        this.relativesModels = relativesModels;
        this.workModels = workModels;
        this.usersCollection = connection.collection('users');
        this.loansCollection = connection.collection('loans');
    }

    async createBorrower(userId) {
        try {
            // Check if user already has a borrower account
            if (await this.borrowerModels.findOne({ userId })) {
                return;
            }
            const borrowerData = {
                userId,
                loanLimit: null,
                income: null,
                status: null,
            };

            // Create borrower object data
            const newBorrower = await this.borrowerModels.create(borrowerData);

            // create user relatives object data
            const [work, relatives] = await Promise.allSettled([
                await this.workModels.create({
                    borrowerId: newBorrower._id,
                }),
                await this.relativesModels.create({ userId }),
            ]);

            const borrower = {
                ...newBorrower._doc,
                relatives: omit(relatives.value._doc, [
                    '_id',
                    '__v',
                    'userId',
                    'createdDate',
                    'modifyDate',
                ]),
                work: work.value._doc,
            };

            delete Object.assign(borrower, { ['borrowerId']: borrower['_id'] })[
                '_id'
            ];
            console.log('Borrower created!', borrower);
            return borrower;
        } catch (error) {
            // console.log('ERROR FROM CREATE BORROWER SERVICE', error);
            throw error;
        }
    }

    async requestVerifyBorrower(userId, payload, files) {
        try {
            payload = await transformNestedObject(payload);

            const user = await this.usersCollection.findOne({
                _id: toObjectId(userId),
            });
            const borrower = await this.borrowerModels.findOne({ userId });

            if (!borrower) {
                throw new NotFoundError('Borrower account not found!');
            }

            if (!user.roles.includes('borrower')) {
                throw new AuthorizeError('User is not a borrower!');
            }

            const { personal, relativesContact } = payload;

            // it will throw an error if there is a missing field
            validateRequest(payload, personal, relativesContact);

            const relatives = {
                firstRelative: {
                    name: relativesContact.firstRelative.name,
                    relation: relativesContact.firstRelative.relation,
                    phoneNumber: relativesContact.firstRelative.phoneNumber,
                },
                secondRelative: {
                    name: relativesContact.secondRelative.name,
                    relation: relativesContact.secondRelative.relation,
                    phoneNumber: relativesContact.secondRelative.phoneNumber,
                },
            };

            await Promise.allSettled([
                await borrower.updateOne({ status: 'pending' }),

                await this.relativesModels.findOneAndUpdate(
                    { userId },
                    {
                        firstRelative: relatives.firstRelative,
                        secondRelative: relatives.secondRelative,
                    },
                ),
                await this.workModels.findOneAndUpdate(
                    { borrowerId: borrower._id },
                    {
                        salary: personal.work.salary,
                        position: personal.work.name,
                    },
                ),
            ]);

            // Upload the files to Firebase Storage
            // const fileUrls = await Promise.all(
            //     files.map(async (file) => {
            //         const category = file.fieldname;
            //         const path = `borrower/${category}/${userId}-${Date.now()}`;
            //         const url = await uploadFileToFirebase(file, path);
            //         return { [category]: url };
            //     }),
            // );

            const currentDate = Date.now();
            const fileUrls = await files.reduce(async (accPromise, file) => {
                const acc = await accPromise;
                const category = file.fieldname;
                const path = `borrower/${category}/${userId}-${currentDate}`;
                const url = await uploadFileToFirebase(file, path);
                acc[category] = url;
                return acc;
            }, {});

            await this.usersCollection.findOneAndUpdate(
                { _id: toObjectId(userId) },
                {
                    $set: {
                        faceImage: fileUrls.faceImage,
                        idCardImage: fileUrls.idCardImage,
                        gender: personal.gender,
                        birthDate: personal.birthDate,
                    },
                },
            );
        } catch (error) {
            throw error;
        }
    }

    async getBorrowerByUserId(payload) {
        try {
            const errors = validateRequestPayload(payload, ['userId', 'roles']);
            if (errors.length > 0) {
                throw new ValidationError(`${errors} field(s) are required!`);
            }

            const { userId, roles } = payload;

            // Check if user is a borrower
            if (!roles.includes('borrower')) {
                throw new AuthorizeError('User is not a borrower!');
            }

            // const ajajda = await borrowerModels
            //     .findOne({ userId: userId })
            //     .populate('userId');
            // // Check if user exists
            // console.log('ajajda', ajajda);

            const [user, borrower] = await Promise.allSettled([
                await usersModels.findOne({ _id: userId }).select({
                    createdDate: 0,
                    modifyDate: 0,
                    __v: 0,
                    password: 0,
                    salt: 0,
                }),
                await borrowerModels
                    .findOne({ userId })
                    .select({ createdDate: 0, modifyDate: 0, __v: 0 }),
            ]);

            if (!user.value) {
                throw new NotFoundError('User not found!');
            }

            const work = await this.workModels
                .findOne({ borrowerId: borrower.value._id })
                .select({
                    borrowerId: 0,
                    __v: 0,
                    createdDate: 0,
                    modifyDate: 0,
                    _id: 0,
                });

            // console.log('user', user);

            const profile = {
                ...user.value._doc,
                ...borrower.value._doc,
                work: work._doc,
            };

            delete profile['_id'];

            console.log('Borrower profile fetched!');

            return profile;
        } catch (error) {
            throw error;
        }
    }

    // async updateBorrowerStatus(userId, status) {
    //     try {
    //         if (!status) {
    //             throw new ValidationError('status is required');
    //         }
    //         if (!userId) {
    //             throw new ValidationError('userId is required');
    //         }

    //         const borrower = await this.borrowerModels.findOneAndUpdate(
    //             { userId: userId },
    //             { status: status },
    //             { new: true },
    //         );
    //         return borrower;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // Borrower can request a loan, and it will be shown in the lender's loan request list
    async requestLoan(user, payload) {
        try {
            const errors = validateRequestPayload(payload, [
                'purpose',
                'amount',
                'tenor',
                'yieldReturn',
                'paymentSchema',
                'borrowingCategory',
            ]);
            if (errors.length > 0) {
                throw new ValidationError(`${errors} field(s) are required!`);
            }

            const {
                purpose,
                amount,
                tenor,
                yieldReturn,
                paymentSchema,
                borrowingCategory,
            } = payload;

            if (yieldReturn < 50000) {
                throw new RequestError('Minimum loan yield is 50000');
            }

            // * - Check if user is a borrower
            if (!user.roles.includes('borrower')) {
                throw new AuthorizeError('User is not a borrower!');
            }

            // check payment schema value is valid
            if (
                paymentSchema !== 'Pelunasan Cicilan' &&
                paymentSchema !== 'Pelunasan Langsung'
            ) {
                throw new RequestError(
                    'Payment schema must be Pelunasan Cicilan or Pelunasan Langsung',
                );
            }

            // * - check if user already has an active loan
            const [loan, borrower] = await Promise.allSettled([
                this.loansCollection.findOne({
                    userId: toObjectId(user.userId),
                }),
                this.borrowerModels.findOne({ userId: user.userId }),
            ]);

            if (borrower.value.status !== 'verified') {
                throw new AuthorizeError(
                    'Borrower must be verified to request a loan!',
                );
            }

            if (
                loan.value &&
                (loan.value.status === 'on request' ||
                    loan.value.status === 'in borrowing' ||
                    loan.value.status === 'on process' ||
                    loan.value.status === 'unpaid')
            ) {
                throw new ActiveLoanError('You already has an active loan!');
            }

            // const loanStatus = await axios.get(
            //     `http://localhost:8004/check/${user.userId}/iniktpnomor`,
            // );
            // const [loanStatus, borrower] = await Promise.allSettled([
            //     axios.get(`http://localhost:8004/check/${user.userId}/iniktpnomor`),
            //     borrowerModels.findOne({ userId: user.userId }),
            // ]);
            console.log('userId', user.userId);

            // const borrower = await this.borrowerModels.findOne({
            //     userId: user.userId,
            // });
            // console.log('borrower', borrower);
            // if (
            //     borrower.status === 'on request' ||
            //     borrower.status === 'in borrowing' ||
            //     borrower.status === 'unpaid' ||
            //     borrower.status === 'on process'
            // ) {
            //     throw new ActiveLoanError('You already has an active loan!');
            // }
            // *TODO - check if user loan limit is not exceeded

            const loanApplication = {
                purpose,
                amount,
                tenor,
                yieldReturn,
                paymentSchema,
                borrowingCategory,
            };

            const userData = {
                userId: user.userId,
                borrowerId: borrower.value._id,
            };

            return { user: userData, loanApplication };
        } catch (error) {
            throw error;
        }
    }
}
