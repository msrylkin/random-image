'use strict';

const controllersToExport = {
    image: require('./image')
};

const wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

module.exports = Object.keys(controllersToExport).reduce((wrappedControllers, controller) => ({
    ...wrappedControllers,
    [controller]: Object.keys(controllersToExport[controller]).reduce((wrappedRoutes, route) => ({
        ...wrappedRoutes,
        [route]: wrapAsync(controllersToExport[controller][route]),
    }), {}),
}), {});
