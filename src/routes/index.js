import { Router } from 'express';
import { UsersController } from '../api/users.js';

const Routes = (channel) => {
    const router = Router();
    const controller = new UsersController(channel);
    router.get('/', controller.getUser.bind(controller));

    return router;
};

export default Routes;
