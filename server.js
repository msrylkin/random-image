'use strict';

require('./models');

const express = require('express');
const config = require('config');
const db = require('./lib/db');
const app = express();

require('./lib/express')(app);

db.connect().then(() => app.listen(process.env.PORT || config.get('port')));

module.exports = app;