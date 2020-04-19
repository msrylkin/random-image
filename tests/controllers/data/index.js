'use strict';

const fs = require('fs');
const path = require('path');

module.exports = fs.readdirSync(__dirname).reduce((acc, file) => {
    if (path.extname(file) === '.json') {
        acc[path.basename(file, '.json')] = require(path.join(__dirname, file));
    }
    return acc;
}, {});
