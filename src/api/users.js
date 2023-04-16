import { responseData } from '../utils/responses.js';

// import userServices from '../services/index.js';
export class UsersController {
    constructor(channel) {
        this.channel = channel;
    }

    async getUser(req, res, next) {
        try {
            // const { userId, roles } = JSON.parse(req.header('user'));
            // const data = await this.authService.getUserData({ userId, roles });
            res.status(200).json(responseData({}));
        } catch (error) {
            next(error);
        }
    }
}
