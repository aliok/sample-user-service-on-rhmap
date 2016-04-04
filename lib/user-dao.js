// get the already promisified Mongoose
var mongoose = require('./database').mongoose;
var Promise = require("bluebird");
var winston = require("winston");
var _ = require('underscore');

var mongooseUtils = require('./util/mongoose-utils');

var User = mongoose.model("User");


/**
 * Provides a nice abstraction for operations on user collection.
 *
 * @module lib/user-dao
 */
module.exports = {
    /**
     * Returns all users. In real world, we'd have pagination.
     * @method
     * @returns {Promise<User[]>} - resolves to users
     */
    getAllUsers: getAllUsers,

    /**
     * Inserts a new document with the given data.
     * @method
     * @param {Object} userData - data to insert
     * @returns {Promise} - resolves to undefined
     */
    createUser: createUser,

    /**
     * Finds the user matching given query.
     * If multiple matching, returns the first one.
     * @method
     * @param {Object} query - {@link https://docs.mongodb.org/manual/reference/method/db.collection.find|A MongoDB query}
     * @return {Promise<User>} - resolves to found user or undefined if nothing found
     */
    findOneUser: findOneUser,

    /**
     * Finds the users matching given query.
     * @method
     * @param {Object} query - {@link https://docs.mongodb.org/manual/reference/method/db.collection.find|A MongoDB query}
     * @param {number} limit - Max number of items to return. If undefined, all is returned.
     * @return {Promise<User[]>} - resolves to found users or empty array if nothing found
     */
    findUsers: findUsers,

    /**
     * Deletes the user matching given query.
     * If multiple matching, deletes the first one.
     * @method
     * @param {Object} query - {@link https://docs.mongodb.org/manual/reference/method/db.collection.find|A MongoDB query}
     * @return {Promise<User>} - resolves to deleted user or undefined if nothing deleted
     */
    deleteOneUser: deleteOneUser,

    /**
     * Updates the user matching given query by replacing the
     * document with given data.
     * If multiple matching, updates the first one.
     *
     * @example
     * // updates gender, name.first; removes location.street of user w/ username "crazybob"
     * updateOneUser({username:"crazybob"}, {
     *     gender:"male",
     *     "name.first": "Bobby",
     *     "location.street": undefined
     * })
     *
     * @method
     * @param {Object} query - {@link https://docs.mongodb.org/manual/reference/method/db.collection.find|A MongoDB query}
     * @param {Object} replacement - data to replace the document with
     * @return {Promise<User>} - resolves to updated user or undefined if nothing updated
     */
    updateOneUser: updateOneUser,

    /**
     * Patches the user matching given query by updating the
     * fields given in the `patch` parameter.
     * If multiple matching, patches the first one.
     * @method
     * @param {Object} query - {@link https://docs.mongodb.org/manual/reference/method/db.collection.find|A MongoDB query}
     * @param {Object} patch - patch object containing field<->value
     * @return {Promise<User>} - resolves to patched user or undefined if nothing patched
     */
    patchOneUser: patchOneUser
};

function getAllUsers(){
    return User
        .findAsync({})
        .catch(logErrorAndReject);
}

function createUser(userData) {
    if (_.isEmpty(userData)) {
        return Promise.reject(new Error("Invalid user data to create user"));
    }

    return Promise.resolve()
        .then(function () {
            // following call might throw a sync error
            // thus, wrap in a promise
            return new User(userData)
                .saveAsync();
        })
        .catch(logErrorAndReject);
}

function findOneUser(query) {
    if (_.isEmpty(query)) {
        return Promise.reject(new Error("Invalid query to find one user"));
    }

    return User
        .findOneAsync(query)
        .catch(logErrorAndReject);
}

function findUsers(query, limit) {
    if (_.isEmpty(query)) {
        return Promise.reject(new Error("Invalid query to find users"));
    }

    if (!_.isNumber(limit)) {
        return Promise.reject(new Error("Invalid limit to find users"));
    }

    return User
        .findAsync(query, {}, {limit: limit})
        .catch(logErrorAndReject);
}

function deleteOneUser(query) {
    if (_.isEmpty(query)) {
        return Promise.reject(new Error("Invalid query to delete one user"));
    }

    return User
        .findOneAndRemoveAsync(query)
        .catch(logErrorAndReject);
}

function updateOneUser(query, replacement) {
    if (_.isEmpty(query)) {
        return Promise.reject(new Error("Invalid query to update one user"));
    }

    if (_.isEmpty(replacement)) {
        return Promise.reject(new Error("Invalid replacement to update one user"));
    }

    // Mongoose has findOneAndUpdate but that is used for patching,
    // not replacing entirely. so, we gotta do the traditional thing:
    // find then update

    return findOneUser(query)
        .then(function (user) {
            if (!user) {
                return undefined;
            }
            else {
                return User.updateAsync(
                    {_id: user._id},
                    replacement,
                    {overwrite: true, runValidators: true});
            }
        })
        .catch(logErrorAndReject);
}

function patchOneUser(query, patch) {
    if (_.isEmpty(query)) {
        return Promise.reject(new Error("Invalid query to patch one user"));
    }
    if (_.isEmpty(patch)) {
        return Promise.reject(new Error("Invalid patch to patch one user"));
    }

    return Promise.resolve()
        .then(function () {
            // following call might throw a sync error
            // thus, wrap in a promise
            return User.findOneAndUpdateAsync(query, patch, {runValidators: true});
        })
        .catch(logErrorAndReject);
}

function logErrorAndReject(err) {
    // we shouldn't log validation errors with level=error since we
    // might have them very often
    if (!mongooseUtils.isValidationError(err)) {
        winston.error("Error during DB operation");
        winston.error(err);
    }
    else {
        winston.debug("Validation error during DB operation");
        winston.debug(err);
    }

    //following makes sure another `catch` (reject handler) is called
    return Promise.reject(err);

}

