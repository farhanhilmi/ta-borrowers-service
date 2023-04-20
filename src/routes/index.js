import { Router } from 'express';
import { UsersController } from '../api/borrower.js';

const Routes = (channel) => {
    const router = Router();
    const controller = new UsersController(channel);
    router.get('/profile', controller.getProfile.bind(controller));

    return router;
};

export default Routes;
