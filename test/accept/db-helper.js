var _ = require('underscore');
var assert = require('assert');
var Promise = require('bluebird');

var sampleUsersJSON = require('../../sample-data/users.json');

var sampleUsers = _.map(sampleUsersJSON.results, function (item) {
    return item.user;
});

module.exports = {
    sampleUsers: sampleUsers,
    sampleUser_A: sampleUsers[0],
    sampleUser_B: sampleUsers[1],
    insertUser: insertUser,
    insertUsers: insertUsers,
    dropDatabase: dropDatabase
};

function insertUser(user, done) {
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


