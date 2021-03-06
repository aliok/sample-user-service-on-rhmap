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
 * @module test/accept/sample-data
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
    insertUsers: insertUsers
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

            // MongoDB driver modifies inserted objects by adding an '_id' field.
            // having the id in the sample data doesn't make sense in our tests.
            // remove that field!
            _.each(users, function(user){
                delete user._id;
            });

            return fulfill(data);
        });
    });
}
