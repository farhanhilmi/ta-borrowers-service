import express from 'express';
import cors from 'cors';

import Routes from './routes/index.js';

export default async (channel) => {
    const app = express();
    app.use(express.json());
    app.use(cors({ origin: '*' }));
    // app.use(cors({ origin: ['http://localhost:8000'] }));

    app.use(Routes(channel));

    // API ENDPOINT NOT FOUND
    app.use((req, res, next) => {
        const error = new Error("API endpoint doesn't exist!");
        error.statusCode = 404;
        error.status = 'Not Found';
        next(error);
    });

    // error handler middleware
    app.use((error, req, res, _) => {
        console.log('error', error);
        const message = !error.statusCode
            ? 'Internal Server Error'
            : error.message;
        res.status(error.statusCode || 500).json({
            status: !error.statusCode ? 'Internal Server Error' : error.status,
            data: [],
            message,
        });
    });

    return app;
};
