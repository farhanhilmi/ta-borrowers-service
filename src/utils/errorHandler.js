export const ERROR_STATUS = {
    OK: {
        code: 200,
        message: 'OK',
    },
    BAD_REQUEST: {
        code: 400,
        message: 'Bad Request',
    },
    UN_AUTHORIZED: {
        code: 403,
        message: 'Unauthorized',
    },
    NOT_FOUND: {
        code: 404,
        message: 'Not Found',
    },
    INTERNAL_ERROR: {
        code: 500,
        message: 'Internal Server Error',
    },
    CONFLICT_ERROR: {
        code: 409,
        message: 'Conflict Error',
    },
};

// const throwError = (message, status) => {
//     var err = new Error(message);
//     err.status = status;
//     throw err;
// };

// const validationError = (message) => {
//     var err = new Error(message);
//     err.status = 400;
//     throw err;
// };

export class ErrorHandler extends Error {
    constructor(statusCode, message, status) {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.status = status;
    }
}

export class ValidationError extends ErrorHandler {
    constructor(message = ERROR_STATUS.BAD_REQUEST.message) {
        super(
            ERROR_STATUS.BAD_REQUEST.code,
            message,
            ERROR_STATUS.BAD_REQUEST.message,
        );
    }
}

export class AuthorizeError extends ErrorHandler {
    constructor(message = ERROR_STATUS.UN_AUTHORIZED.message) {
        super(
            ERROR_STATUS.UN_AUTHORIZED.code,
            message,
            ERROR_STATUS.UN_AUTHORIZED.message,
        );
    }
}

export class NotFoundError extends ErrorHandler {
    constructor(message = ERROR_STATUS.NOT_FOUND.message) {
        super(
            ERROR_STATUS.NOT_FOUND.code,
            message,
            ERROR_STATUS.NOT_FOUND.message,
        );
    }
}

export class DataConflictError extends ErrorHandler {
    constructor(message = ERROR_STATUS.CONFLICT_ERROR.message) {
        super(
            ERROR_STATUS.CONFLICT_ERROR.code,
            message,
            ERROR_STATUS.CONFLICT_ERROR.message,
        );
    }
}

// const jajaa = new NotFoundError('Tidak ditemukan');
// console.log(jajaa);
