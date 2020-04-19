'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
const swaggerUi = require('swagger-ui-express');
const imageController = require('../controllers').image;
const { ApiError, ValidationError } = require('../lib/errors');
const imageValidation = require('../validation').image;
const { RequestCache } = require('../lib/cache');
const imageCache = new RequestCache();
const { swaggerSpec } = require('./swagger');

const loggerConfig = {
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    ),
};

module.exports = function(app) {
    if (process.env.NODE_ENV !== 'test') {
        app.use(expressWinston.logger(loggerConfig));
    }
    if (process.env.NODE_ENV !== 'production') {
        app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }
    app.post('/image', imageCache.reset(), imageController.processRandomImage);
    app.get('/image/:id', imageValidation.getImageById, imageController.getImageById);
    app.get('/images', imageValidation.getImageList, imageCache.cache(), imageController.getImageList);
    if (process.env.NODE_ENV !== 'test') {
        app.use(expressWinston.errorLogger(loggerConfig));
    }
    app.use((err, req, res, next) => {
        if (err instanceof ValidationError) {
            res.status(err.statusCode).json({
                code: 'ValidationError',
                message: err.message,
                validationErrors: err.validationErrors,
            });
        } else if (err instanceof ApiError) {
            res.status(err.statusCode).json({
                code: err.name,
                message: err.message,
            });
        } else {
            res.status(500).json({
                code: 'InternalError',
                message: process.env.NODE_ENV !== 'production' && err.message || 'InernalError',
            });
        }
    });
    app.use((req, res, next) => {
        res.status(404).json({
            code: 'NotFound',
            message: 'Page not found',
        });
    });
};