// get the already promisified Mongoose
var mongoose = require('./database').mongoose;
var Promise = require("bluebird");
var winston = require("winston");

var User = mongoose.model("User");

/**
 * Provides a nice abstraction for operations on user collection.
 *
 * @module lib/user-dao
 */
module.exports = {
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

function createUser(userData) {
    var user = new User(userData);
    return user
        .saveAsync()
        .catch(logErrorAndReject);
}

function findOneUser(query) {
    return User
        .findOneAsync(query)
        .catch(logErrorAndReject);
}

function findUsers(query, limit) {
    return User
        .findAsync(query, {}, {limit: limit})
        .catch(logErrorAndReject);
}

function deleteOneUser(query) {
    return User
        .findOneAndRemoveAsync(query)
        .catch(logErrorAndReject);
}

function updateOneUser(query, replacement) {
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
                    {overwrite: true});
            }
        })
        .catch(logErrorAndReject);
}

function patchOneUser(query, patch) {
    return User.findOneAndUpdateAsync(query, patch)
        .catch(logErrorAndReject);
}

function logErrorAndReject(err) {
    winston.error("Error during DB operation");
    winston.error(err);
    //following makes sure another `catch` (reject handler) is called
    return Promise.reject(err);
}

