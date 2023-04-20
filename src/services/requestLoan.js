import borrowerModels from '../database/models/borrower.models.js';
import {
    ActiveLoanError,
    AuthorizeError,
    ValidationError,
} from '../utils/errorHandler.js';
import { validateRequestPayload } from '../utils/index.js';
import axios from 'axios';

export default async (user, payload) => {
    const errors = validateRequestPayload(payload, [
        'loanPurpose',
        'amount',
        'tenor',
        'interestRate',
        'repaymentSource',
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
    const [loanStatus, borrower] = await Promise.allSettled([
        axios.get(`http://localhost:8004/check/${user.userId}/iniktpnomor`),
        borrowerModels.findOne({ userId: user.userId }),
    ]);

    if (loanStatus.value.data.status !== 'OK') {
        throw new ActiveLoanError('You already has an active loan!');
    }
    // * - check if user loan limit is not exceeded

    const loanApplication = {
        loanPurpose,
        amount,
        tenor,
        interestRate,
        repaymentAmount,
        repaymentDate,
    };

    const userData = {
        userId: user.userId,
        borrowerId: borrower.value._id,
    };

    return { user: userData, loanApplication };
};
