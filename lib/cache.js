'use strict';

const NodeCache = require("node-cache");
const config = require('config');

const defaultTtl = config.get('cache.ttl');

class RequestCache {
    constructor(ttl = defaultTtl) {
        this.store = new NodeCache({ checkperiod: 100, stdTTL: ttl });
    }

    cache(ttl) {
        return (req, res, next) => {
            const key = req.originalUrl || req.url;
            const cachedResponse = this.store.get(key);
            if (cachedResponse) {
                res.json(cachedResponse);
            } else {
                const jsonFn = res.json;
                res.json = (body) => {
                    this.store.set(key, body, ttl);
                    jsonFn.call(res, body);
                }
                next();
            }
        }
    }

    reset() {
        return (req, res, next) => {
            res.on('finish', () => {
                this.store.flushAll();
            });
            next();
        }
    }
}

module.exports = { RequestCache };
