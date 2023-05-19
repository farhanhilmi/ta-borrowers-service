import { responseData } from '../utils/responses.js';
import { PublishMessage, SubscribeMessage } from '../utils/messageBroker.js';
import subscribeEvents from '../services/subscribeEvents.js';
import getProfile from '../services/profile/get.js';
import { AuthorizeError } from '../utils/errorHandler.js';
import config from '../config/index.js';
import requestLoan from '../services/requestLoan.js';
import updateBorrowerStatus from '../services/updateBorrowerStatus.js';
import BorrowerService from '../services/borrower.services.js';
// import userServices from '../services/index.js';
// subscribeEvents()
export class UsersController {
    constructor() {
        // this.channel = channel;
        // To listen
        SubscribeMessage(subscribeEvents, 'Borrower').catch((error) => {
            console.log('ERROR FROM ', error);
            throw error;
        });
        this.borrowerService = new BorrowerService();
    }

    async getProfile(req, res, next) {
        try {
            if (!req.header('user')) {
                throw new AuthorizeError(
                    'Request header not provided from API Gateway!',
                );
            }
            const { userId, roles } = JSON.parse(req.header('user'));
            const data = await this.borrowerService.getBorrowerByUserId({
                userId,
                roles,
            });
            res.status(200).json(responseData(data));
        } catch (error) {
            next(error);
        }
    }

    async postRequestLoan(req, res, next) {
        try {
            if (!req.header('user')) {
                throw new AuthorizeError(
                    'Request header not provided from API Gateway!',
                );
            }
            const { userId, roles } = JSON.parse(req.header('user'));
            console.log('userId', userId);
            const payload = req.body;
            const data = await this.borrowerService.requestLoan(
                { userId, roles },
                payload,
            );
            // Publish to message broker (Loans service)
            PublishMessage(data, 'LOAN_REQUEST', 'Loan');
            // PublishMessage(
            //     this.channel,
            //     config.RABBITMQ.CHANNEL.LOAN,
            //     JSON.stringify({ data, event: 'LOAN_REQUEST' }),
            // );
            res.status(201).json(responseData([], 'OK', '   '));
        } catch (error) {
            next(error);
        }
    }
}
