
'use strict';

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict error'
}

const myloggerLog = require('../loggers/mylogger.log');
const {
    StatusCodes,
    ReasonPhrases
} = require('../utils/httpStatusCode')


class ErrorResponse extends Error {
    constructor (message, status) {
        super(message)
        this.status = status

        // log the error use winston
        myloggerLog.error(this.message,['/api/v1/login', 'vv2379', {error: 'Bad request error'}])
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor (message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor (message = ReasonStatusCode.FORBIDDEN, statusCode = StatusCode.FORBIDDEN, additionalInfo = null) {
        super(message, statusCode);
        this.additionalInfo = additionalInfo;
    }
}

class AuthFailureError extends ErrorResponse {

    constructor (message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED) {
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse {

    constructor (message = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND) {
        super(message, statusCode)
    }
}

class ForbiddenError extends ErrorResponse {

    constructor (message = ReasonPhrases.FORBIDDEN, statusCode = StatusCodes.FORBIDDEN) {
        super(message, statusCode)
    }
}

class RedisErrorResponse extends ErrorResponse {

    constructor (message = ReasonPhrases.INTERNAL_SERVER_ERROR, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message, statusCode)
    }
}

module.exports = {
    ErrorResponse,
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError,
    RedisErrorResponse
}