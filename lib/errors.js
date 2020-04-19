'use strict';

class ExtendableError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, ExtendableError);
    }
}

class ApiError extends ExtendableError {
    constructor(message, statusCode) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode || 500;
    }
}

class NotFoundError extends ApiError {
    constructor(entity, id) {
        super(`${entity} with id ${id} was not found`);
        this.entity = entity;
        this.id = id;
        this.statusCode = 404;
        this.name = 'NotFoundError';
    }
}

class ValidationError extends ApiError {
    constructor(validationErrors) {
        super('Wrong schema');
        this.statusCode = 422;
        this.name = 'ValidationError';
        this.validationErrors = validationErrors;
    }
}

class DatabaseError extends ExtendableError {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
    }
}

class UniqueConstraintError extends DatabaseError {
    constructor(model, field, value) {
        super(`Field ${field} of model ${model} should be unique. Value: ${value}`);
        this.name = 'UniqueConstraintError';
        this.field = field;
        this.model = model;
        this.value = value;
    }
}

module.exports = { ApiError, NotFoundError, ValidationError, DatabaseError, UniqueConstraintError };