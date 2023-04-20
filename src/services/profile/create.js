import borrowerModels from '../../database/models/borrower.models.js';
import workModels from '../../database/models/work.models.js';

export default async (userId) => {
    // // Validate request payload
    // const errors = validateRequestPayload(payload, ['userId', 'roles']);
    // if (errors.length > 0) {
    //     throw new ValidationError(`${errors} field(s) are required!`);
    // }

    // const { userId, roles } = payload;

    // // Check if user is a borrower
    // if (!roles.includes('borrower')) {
    //     throw new AuthorizeError('User is not a borrower!');
    // }

    // // Check if user exists
    // const user = await getUserById(userId);
    // if (!user) {
    //     throw new ValidationError('userId not found!');
    // }

    // // Check if borrower already exists with given userId
    // const borrower = await borrowerModels.findOne({ userId });
    // if (borrower) {
    //     throw new DataConflictError(
    //         'Borrower already exists with that userId!',
    //     );
    // }

    const borrowerData = {
        userId,
        loanLimit: null,
        income: null,
        status: null,
    };

    // Create borrower object data
    const newBorrower = await borrowerModels.create(borrowerData);

    // Create work object data
    const work = await workModels.create({ borrowerId: newBorrower._id });

    const borrower = {
        ...newBorrower._doc,
        work: work._doc,
    };

    console.log('Borrower created!', borrower);

    return borrower;
};
