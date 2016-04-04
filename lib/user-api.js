var _ = require('underscore');
var Promise = require('bluebird');

var userDao = require('./user-dao');
var expressUtils = require('./util/express-utils');
var mongooseUtils = require('./util/mongoose-utils');

var MAX_SEARCH_RESULTS = 30;

module.exports = {
    getUserByUsername: getUserByUsername,
    deleteUserByUsername: deleteUserByUsername,
    updateUserByUsername: updateUserByUsername,
    patchUserByUsername: patchUserByUsername,
    createUser: createUser,
    searchUsers: searchUsers
};

function getUserByUsername(req, res) {
    var userName = req.params.username;
    if (_.isEmpty(userName)) {
        return expressUtils.respondInvalidRequestError(res, "No username passed");
    }

    return userDao.findOneUser({username: userName})
        .then(function (user) {
            if (!user) {
                return expressUtils.respondNotFound(res, "No user found");
            }
            return res.json(stripUser(user.toJSON()));
        })
        .catch(expressUtils.respondServerErrorHandler(res));
}

function deleteUserByUsername(req, res) {
    var userName = req.params.username;
    if (_.isEmpty(userName)) {
        return expressUtils.respondInvalidRequestError(res, "No username passed");
    }

    return userDao.deleteOneUser({username: userName})
        .then(function (user) {
            if (user) {
                return expressUtils.respondOK(res);
            }
            else {
                return expressUtils.respondNotFound(res, "No user found");
            }
        })
        .catch(expressUtils.respondServerErrorHandler(res));
}

function updateUserByUsername(req, res) {
    var userName = req.params.username;
    if (_.isEmpty(userName)) {
        return expressUtils.respondInvalidRequestError(res, "No username passed");
    }

    var userData = req.body;
    if (_.isEmpty(userData)) {
        return expressUtils.respondInvalidRequestError(res, "No user data passed");
    }

    userData = stripUser(userData);

    return userDao.updateOneUser({username: userName}, userData)
        .then(function (user) {
            if (user) {
                return expressUtils.respondOK(res);
            }
            else {
                return expressUtils.respondNotFound(res, "No user found");
            }
        })
        .catch(handleDatabaseError(res))
        .catch(expressUtils.respondServerErrorHandler(res));
}

function patchUserByUsername(req, res) {
    var userName = req.params.username;
    if (_.isEmpty(userName)) {
        return expressUtils.respondInvalidRequestError(res, "No username passed");
    }

    var patch = req.body;
    if (_.isEmpty(patch)) {
        return expressUtils.respondInvalidRequestError(res, "No patch passed");
    }

    return userDao.patchOneUser({username: userName}, patch)
        .then(function (user) {
            if (user) {
                return expressUtils.respondOK(res);
            }
            else {
                return expressUtils.respondNotFound(res, "No user found");
            }
        })
        .catch(handleDatabaseError(res))
        .catch(expressUtils.respondServerErrorHandler(res));
}

function createUser(req, res) {
    var userData = req.body;
    if (_.isEmpty(userData)) {
        return expressUtils.respondInvalidRequestError(res, "No user data passed");
    }

    userData = stripUser(userData);

    return userDao.createUser(userData)
        .then(expressUtils.respondOKHandler(res))
        .catch(handleDatabaseError(res))
        .catch(expressUtils.respondServerErrorHandler(res));
}

function searchUsers(req, res) {
    var query = req.body;
    if (_.isEmpty(query)) {
        return expressUtils.respondInvalidRequestError(res, "No query passed");
    }

    query = stripUser(query);
    if (_.isEmpty(query)) {
        return expressUtils.respondInvalidRequestError(res, "Passed query only has omitted properties");
    }

    return userDao.findUsers(query, MAX_SEARCH_RESULTS)
        .then(function (users) {
            var strippedUsers = _.map(users, function (user) {
                return stripUser(user.toJSON());
            });
            return res.json(strippedUsers);
        })
        .catch(expressUtils.respondServerErrorHandler(res));
}

/**
 * Returns a higher order function to use in promise chains. Wrapped function
 * responds 400 if error is a validation error. If not, promise is rejected so that
 * next error handler catches it and does whatever.
 * @param {Response} res
 * @return {Function} - the higher order function to use in promise chains.
 */
function handleDatabaseError(res) {
    return function (err) {
        if (mongooseUtils.isMongooseValidationError(err)) {
            return expressUtils.respondInvalidRequestError(res, err.toString());
        }
        else {
            return Promise.reject(err);
        }
    };
}

function stripUser(user) {
    return _.omit(user, ['_id', '__v', 'md5', 'sha1', 'sha256', 'salt', 'password']);
}
