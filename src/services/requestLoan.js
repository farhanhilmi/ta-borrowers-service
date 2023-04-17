import { ValidationError } from '../utils/errorHandler.js';
import { validateRequestPayload } from '../utils/index.js';

export default (user, payload) => {
    const errors = validateRequestPayload(payload, [
        'loanPurpose',
        'amount',
        'tenor',
        'interestRate',
        'repaymentAmount',
        'repaymentDate',
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
    } = payload;

    // * TODO:
    // * - Check if user is a borrower
    // * - check if user already has an active loan
    // * - check if user loan limit is not exceeded

    const loanApplication = {
        loanPurpose,
        amount,
        tenor,
        interestRate,
        repaymentAmount,
        repaymentDate,
    };

    const user = {
        userId: '',
        borrowerId: '',
    };

    return { user, loanApplication };
};
