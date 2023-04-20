import { responseData } from '../utils/responses.js';
import { PublishMessage, SubscribeMessage } from '../utils/messageBroker.js';
import subscribeEvents from '../services/subscribeEvents.js';
import getProfile from '../services/profile/get.js';
import { AuthorizeError } from '../utils/errorHandler.js';
import config from '../config/index.js';
import requestLoan from '../services/requestLoan.js';
// import userServices from '../services/index.js';
// subscribeEvents()
export class UsersController {
    constructor(channel) {
        this.channel = channel;
        // To listen
        SubscribeMessage(channel, subscribeEvents);
    }

    async getProfile(req, res, next) {
        try {
            if (!req.header('user')) {
                throw new AuthorizeError(
                    'Request header not provided from API Gateway!',
                );
            }
            const { userId, roles } = JSON.parse(req.header('user'));
            const data = await getProfile({ userId, roles });
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
            const data = await requestLoan({ userId, roles }, payload);
            // Publish to message broker (Loans service)
            PublishMessage(
                this.channel,
                config.RABBITMQ.CHANNEL.LOAN,
                JSON.stringify({ data, event: 'LOAN_REQUEST' }),
            );
            res.status(201).json(
                responseData(
                    [],
                    'OK',
                    'Loan request sent! Please check accordingly in your dashboard and your email for further information!',
                ),
            );
        } catch (error) {
            next(error);
        }
    }
}
