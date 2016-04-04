var winston = require("winston");

/**
 * Provides Express related functions that are used common.
 *
 * @module lib/util/express-utils
 */
var expressUtils = module.exports = {
    /**
     * Responds with `{"OK": 1}`;
     * @param {Response} res    - response
     */
    respondOK: function (res) {
        return res.json({"OK": 1});
    },

    /**
     * Returns a higher order function to pass promise chains.
     * Calls {@link module:utils/expressUtils.responseOK}
     *
     * @param {Response} res    - response
     * @return {Function} higher order function
     */
    respondOKHandler: function (res) {
        return function () {
            return expressUtils.respondOK(res);
        };
    },

    /**
     * Responds with HTTP 400 with the given message.
     * @param {Response} res    - response
     * @param {string} message  - message to send
     */
    respondInvalidRequestError: function (res, message) {
        return returnWithStatus(res, 400, message);
    },

    /**
     * Returns a higher order function to pass promise chains.
     * Returned function responds with HTTP 400 with the given message.
     * @param {Response} res    - response
     * @param {string} message  - message to send
     * @return {Function} higher order function
     */
    respondInvalidRequestErrorHandler: function (res, message) {
        return function () {
            return expressUtils.respondInvalidRequestError(res, message);
        };
    },

    /**
     * Responds with HTTP 404 with the given message.
     * @param {Response} res    - response
     * @param {string} message  - message to send
     */
    respondNotFound: function (res, message) {
        return returnWithStatus(res, 404, message);
    },

    /**
     * Returns a higher order function to pass promise chains.
     * Returned function responds with HTTP 500 with a generic message.
     * We don't want to tell user too much in case of some server error.
     * @param {Response} res    - response
     * @return {Function} higher order function
     */
    respondServerErrorHandler: function (res) {
        return function (err) {
            winston.error(err);
            return returnWithStatus(res, 500, "Oops something went wrong");
        };
    }
};


function returnWithStatus(res, status, message) {
    res.status(status);
    return res.json({
        "status": status,
        "message": message
    });
}
