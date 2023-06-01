import borrowerModels from '../database/models/borrower.models.js';
import {
    ActiveLoanError,
    AuthorizeError,
    ValidationError,
} from '../utils/errorHandler.js';
import { validateRequestPayload } from '../utils/index.js';

export default async (user, payload) => {
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

        const borrower = await borrowerModels.findOne({ userId: user.userId });
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
};
