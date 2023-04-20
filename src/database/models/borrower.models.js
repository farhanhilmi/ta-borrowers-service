import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        loanLimit: {
            type: String,
            default: null,
        },
        income: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'createdDate', updatedAt: 'modifyDate' },
        collection: 'borrowers',
    },
);

export default mongoose.model('Borrowers', schema);
