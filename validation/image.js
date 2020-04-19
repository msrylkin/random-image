'use strict';

const { param, query } = require('express-validator');

const getImageById = [
    param('id', 'must be string').notEmpty().isString(),
];

const getImageList = [
    query('page', 'must be positive number').optional().isInt({ gt: 0 }),
    query('limit', 'must be positive number').optional().isInt({ gt: 0 }),
    query('sort').optional().isIn(['desc', 'asc']),
    query('dateStart').optional().isISO8601(),
    query('dateEnd').optional().isISO8601(),
];

module.exports = { getImageById, getImageList };