'use strict';

const axios = require('axios');
const config = require('config');
const logger = require('./logger');

const api_key = config.get('giphy.apiKey');
const baseUrl = config.get('giphy.baseUrl');
const randomImageUrl = config.get('giphy.randomImageUrl');
const giphyRequest = axios.create({
    baseURL: baseUrl,
});
giphyRequest.interceptors.request.use((config) => {
    config.params = config.params || {};
    config.params.api_key = api_key;
    return config;
});

async function getRandomImage() {
    try {
        const result = await giphyRequest.get(randomImageUrl);
        return result.data;
    } catch (err) {
        logger.error('Error requesting random image giphy api, err: ', err);
        throw err;
    }
}

module.exports = { getRandomImage };