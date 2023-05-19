import borrowerModels from '../database/models/borrower.models.js';
import relativesModels from '../database/models/relatives.models.js';
import workModels from '../database/models/work.models.js';
import {
    ActiveLoanError,
    AuthorizeError,
    NotFoundError,
    ValidationError,
} from '../utils/errorHandler.js';
import { omit, validateRequestPayload } from '../utils/index.js';

export default class BorrowerService {
    constructor() {
        this.borrowerModels = borrowerModels;
        this.relativesModels = relativesModels;
        this.workModels = workModels;
    }

    async createBorrower(userId) {
        try {
            console.log('MASUK');
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

    async requestLoan(user, payload) {
        try {
            const errors = validateRequestPayload(payload, [
                'loanPurpose',
                'amount',
                'tenor',
                'interestRate',
                'repaymentSource',
                'description',
                // 'repaymentDate',
            ]);
            if (errors.length > 0) {
                throw new ValidationError(`${errors} field(s) are required!`);
            }

            const {
                loanPurpose,
                amount,
                tenor,
                interestRate,
                repaymentAmount,
                repaymentDate,
                description,
            } = payload;

            // * TODO:
            // * - Check if user is a borrower
            if (!user.roles.includes('borrower')) {
                throw new AuthorizeError('User is not a borrower!');
            }
            // * - check if user already has an active loan
            // const loanStatus = await axios.get(
            //     `http://localhost:8004/check/${user.userId}/iniktpnomor`,
            // );
            // const [loanStatus, borrower] = await Promise.allSettled([
            //     axios.get(`http://localhost:8004/check/${user.userId}/iniktpnomor`),
            //     borrowerModels.findOne({ userId: user.userId }),
            // ]);
            console.log('userId', user.userId);

            const borrower = await this.borrowerModels.findOne({
                userId: user.userId,
            });
            console.log('borrower', borrower);
            if (
                borrower.status === 'on request' ||
                borrower.status === 'in borrowing' ||
                borrower.status === 'unpaid' ||
                borrower.status === 'on process'
            ) {
                throw new ActiveLoanError('You already has an active loan!');
            }
            // *TODO - check if user loan limit is not exceeded

            const loanApplication = {
                loanPurpose,
                amount,
                tenor,
                interestRate,
                repaymentAmount,
                repaymentDate,
                description,
            };

            const userData = {
                userId: user.userId,
                borrowerId: borrower._id,
            };

            return { user: userData, loanApplication };
        } catch (error) {
            throw error;
        }
    }
}
