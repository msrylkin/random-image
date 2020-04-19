'use strict';

const mongoose = require('mongoose');

const { UniqueConstraintError } = require('../lib/errors');

const ImageSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    title: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

ImageSchema.post('save', (err, doc, next) => {
    if (err.name === 'MongoError' && err.code === 11000) {
        next(new UniqueConstraintError('Image', '_id', doc._id));
        return;
    }
    next();
})

ImageSchema.statics = {
    list: function({ page = 0, limit = 30, sort = 'desc', dateStart, dateEnd } = {}) {
        const opts = {};

        if (dateStart || dateEnd) {
            opts.createdAt = {};
            if (dateStart) {
                opts.createdAt.$gte = new Date(dateStart);
            }
            if (dateEnd) {
                opts.createdAt.$lt = new Date(dateEnd);
            }
        }

        return this.find(opts)
            .sort({ createdAt: sort })
            .limit(limit)
            .skip(limit * page)
            .exec();
    },
};

mongoose.model('Image', ImageSchema);