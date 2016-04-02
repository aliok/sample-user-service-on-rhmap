var _ = require('underscore');
var assert = require('assert');

var userDao = require('./user-dao');
var userValidator = require('./user-validator');
var expressUtils = require('./expressUtils');

var service = module.exports = {
    getUserByUsername: getUserByUsername,
    deleteUserByUsername: deleteUserByUsername,
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
    return res.json({foo: 1});
}

function createUser(req, res) {
    var userData = req.body;
    if (_.isEmpty(userData)) {
        return expressUtils.respondInvalidRequestError(res, "No user data passed");
    }

    userData = stripUser(userData);
    var validationResult = userValidator.validate(userData);
    if (validationResult) {
        return expressUtils.respondInvalidRequestError(res, validationResult.message);
    }

    return userDao.createUser(userData)
        .then(expressUtils.respondOKHandler(res))
        .catch(expressUtils.respondServerErrorHandler(res));
}

function stripUser(user) {
    return _.omit(user, ['_id', 'md5', 'sha1', 'sha256', 'salt', 'password']);
}
