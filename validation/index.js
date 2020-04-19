'use strict';

const { validationResult } = require('express-validator');
const { ValidationError } = require('../lib/errors');

const validators = {
    image: require('./image')
};

module.exports = Object.keys(validators).reduce((extendedValidator, validator) => ({
    ...extendedValidator,
    [validator]: Object.keys(validators[validator]).reduce((wrappedRoutes, route) => ({
        ...wrappedRoutes,
        [route]: [...validators[validator][route], (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(new ValidationError(errors.array()));
                return;
            }
            next();
        }],
    }), {}),
}), {});