import borrowerModels from '../database/models/borrower.models.js';
import { ValidationError } from '../utils/errorHandler.js';

export default async (userId, status) => {
    try {
        if (!status) {
            throw new ValidationError('status is required');
        }
        if (!userId) {
            throw new ValidationError('userId is required');
        }

        const borrower = await borrowerModels.findOneAndUpdate(
            { userId: userId },
            { status: status },
            { new: true },
        );
        return borrower;
    } catch (error) {
        throw error;
    }
};
