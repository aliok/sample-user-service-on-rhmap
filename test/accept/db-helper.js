var _ = require('underscore');
var assert = require('assert');
var Promise = require('bluebird');

var sampleUsersJSON = require('../../sample-data/users.json');

var sampleUsers = _.map(sampleUsersJSON.results, function (item) {
    return item.user;
});

/**
 * Provides a helpers to prepare acceptance test cases.
 *
 * Methods in here don't use Mongoose. They use MongoDB native driver
 * directly to be able to prepare test data w/o validation.
 *
 * @module test/accept/db-helper
 */
module.exports = {
    /**
     * All sample users from `sample-data/user.json` file.
     */
    sampleUsers: sampleUsers,

    /**
     * One sample user.
     */
    sampleUser_A: sampleUsers[0],

    /**
     * Another sample user.
     */
    sampleUser_B: sampleUsers[1],

    /**
     * Inserts given user to DB collection.
     * @method
     * @param user
     * @return {Promise<User[]>} - resolves to inserted document wrapped in an array
     */
    insertUser: insertUser,

    /**
     * Inserts given users to DB collection.
     * @method
     * @param {Object[]} - users
     * @return {Promise<User[]>} - resolves to inserted documents
     */
    insertUsers: insertUsers,

    /**
     * Drops database so that we have a clean state.
     * @method
     * @return {Promise} - resolves to undefined
     */
    dropDatabase: dropDatabase
};

function insertUser(user) {
    return new Promise(function (fulfill, reject) {
        assert(user);
        assert(!_.isArray(user));
        return insertUsers([user])
            .then(fulfill)
            .catch(reject);
    });
}

function insertUsers(users) {
    return new Promise(function (fulfill, reject) {
        assert(users);
        assert(_.isArray(users));

        // we have to get this fresh
        // otherwise connection is already closed
        var mongoose = require("mongoose");
        mongoose.connection.db.collection("users").insert(users, function (err, data) {
            if (err) {
                return reject(err);
            }
            return fulfill(data);
        });
    });
}

/**
 * Drops the MongoDB database.
 */
function dropDatabase() {
    return new Promise(function (fulfill, reject) {
        // we have to get this fresh
        // otherwise connection is already closed
        var mongoose = require("mongoose");
        mongoose.connection.db.dropDatabase(function (err, result) {
            if (err) {
                reject(err);
            }
            else if (!result) {
                reject(new Error("Drop database call returned " + result));
            }
            else {
                fulfill();
            }
        });
    });
}


