var assert = require('assert');
var Promise = require('bluebird');

var database;

/**
 * Provides a helpers for database operations during tests.
 *
 * @module test/db-helper
 */
module.exports = {

    /**
     * Connects to database with the given name.
     * @param dbName
     * @method
     * @return {Promise} - resolves to undefined
     */
    connectToDatabase: connectToDatabase,

    /**
     * Disconnects from the database.
     * @method
     * @return {Promise} - resolves to undefined
     */
    disconnectDatabase: disconnectDatabase,

    /**
     * Drops database so that we have a clean state.
     * @method
     * @return {Promise} - resolves to undefined
     */
    dropDatabase: dropDatabase,

    /**
     * While testing we can't do the index creation in the background.
     * Tests are run too fast and they fail in that case.
     *
     * We manually ensure indexes before doing the db operations first.
     * @method
     * @return {Promise} - resolves to undefined
     */
    ensureIndexes: ensureIndexes
};

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

function ensureIndexes() {
    return new Promise(function (fulfill, reject) {
        var userModel = require('../lib/user-model');

        userModel.ensureIndexes(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });
}


function connectToDatabase(dbName) {
    assert(dbName);

    process.env.MONGODB_SERVICE_HOST = "localhost";
    process.env.MONGODB_USER = "";
    process.env.MONGODB_PASSWORD = "";
    process.env.MONGODB_SERVICE_PORT = "";
    process.env.MONGODB_DATABASE = dbName;
    database = require('../lib/database');

    return new Promise(function (fulfill, reject) {
        database.connect(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });
}

function disconnectDatabase() {
    return new Promise(function (fulfill, reject) {
        database.disconnect(function (err) {
            if (err) {
                return reject(err);
            }
            return fulfill();
        });
    });
}
