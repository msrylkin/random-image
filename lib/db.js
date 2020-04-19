'use strict';

const Promise = require('bluebird');
const config = require('config');
const mongoose = require('mongoose');
const logger = require('./logger');

const connectionString = config.get('db.connectionString');

mongoose.Promise = Promise;

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    mongoose.set('debug', true);
}

exports.connect = () => {
    mongoose
        .connect(connectionString, {
            keepAlive: 1,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => logger.info('MongoDB connected'));
    return mongoose.connection;
};