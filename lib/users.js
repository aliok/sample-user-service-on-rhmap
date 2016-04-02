var _ = require('underscore');
var assert = require('assert');
var winston = require('winston');

var userDao = require('./user-dao');
var userValidator = require('./user-validator');
var expressUtils = require('./expressUtils');

var service = module.exports = {
    getUserByUsername: getUserByUsername,
    deleteUserByUsername: deleteUserByUsername,
    updateUserByUsername: updateUserByUsername,
    createUser: createUser
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

    // TODO: what about password?
    // TODO: what about generation of salt, sha1 etc
    userData = stripUser(userData);
    var validationResult = userValidator.validateForUpdate(userData);
    if (validationResult) {
        return expressUtils.respondInvalidRequestError(res, validationResult.message);
    }

    return userDao.updateOneUser({username: userName}, userData)
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

function createUser(req, res) {
    var userData = req.body;
    if (_.isEmpty(userData)) {
        return expressUtils.respondInvalidRequestError(res, "No user data passed");
    }

    // TODO: what about password?
    // TODO: what about generation of salt, sha1 etc
    userData = stripUser(userData);
    var validationResult = userValidator.validateForCreate(userData);
    if (validationResult) {
        return expressUtils.respondInvalidRequestError(res, validationResult.message);
    }

    return userDao.createUser(userData)
        .then(expressUtils.respondOKHandler(res))
        .catch(expressUtils.respondServerErrorHandler(res));
}

function stripUser(user) {
    return _.omit(user, ['_id', '__v', 'md5', 'sha1', 'sha256', 'salt', 'password']);
}
