'use strict';

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Random image API',
      version: '1.0.0',
    },
  },
  apis: ['./controllers/**/*.js'],
};

module.exports = {
  swaggerSpec: swaggerJSDoc(options),
};
