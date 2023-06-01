import { Router } from 'express';
import { UsersController } from '../api/borrower.js';

const Routes = () => {
    const router = Router();
    const controller = new UsersController();
    router.get('/profile', controller.getProfile.bind(controller));

    router.post('/loan', controller.postRequestLoan.bind(controller));
    router.put(
        '/request/verification',
        controller.putVerifyBorrower.bind(controller),
    );

    return router;
};

export default Routes;
