import borrowerModels from '../../database/models/borrower.models.js';
import usersModels from '../../database/models/users.models.js';
import workModels from '../../database/models/work.models.js';
import { NotFoundError, ValidationError } from '../../utils/errorHandler.js';
import { validateRequestPayload } from '../../utils/index.js';

export default async (payload) => {
    const errors = validateRequestPayload(payload, ['userId', 'roles']);
    if (errors.length > 0) {
        throw new ValidationError(`${errors} field(s) are required!`);
    }

    const { userId, roles } = payload;

    // Check if user is a borrower
    if (!roles.includes('borrower')) {
        throw new AuthorizeError('User is not a borrower!');
    }

    // Check if user exists

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

    const work = await workModels
        .findOne({ borrowerId: borrower.value._id })
        .select({
            borrowerId: 0,
            __v: 0,
            createdDate: 0,
            modifyDate: 0,
            _id: 0,
        });

    console.log('user', user);

    const profile = {
        ...user.value._doc,
        ...borrower.value._doc,
        work: work._doc,
    };

    delete profile['_id'];

    console.log('Borrower profile fetched!');

    return profile;
};
