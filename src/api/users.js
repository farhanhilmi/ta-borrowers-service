// import userServices from '../services/index.js';
export class UsersController {
    constructor(channel) {
        this.channel = channel;
    }

    async getUser(req, res, next) {
        try {
            // const { userId, roles } = JSON.parse(req.header('user'));
            // const data = await this.authService.getUserData({ userId, roles });
            // res.status(200).json({
            //     status: 'OK',
            //     message: 'success fetching data',
            //     data,
            // });
        } catch (error) {
            next(error);
        }
    }
}
