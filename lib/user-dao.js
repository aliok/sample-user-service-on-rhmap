// get the already promisified Mongoose
var mongoose = require('./database').mongoose;
var Promise = require("bluebird");
var winston = require("winston");

var User = mongoose.model("User");

module.exports = {
    createUser: createUser,
    findOneUser: findOneUser,
    findUsers: findUsers,
    deleteOneUser: deleteOneUser

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

function findUsers(query) {
    return User
        .findAsync(query)
        .catch(logErrorAndReject);
}

function deleteOneUser(query) {
    return User
        .findOneAndRemoveAsync(query)
        .catch(logErrorAndReject);
}

function logErrorAndReject(err) {
    winston.error("Error during DB operation");
    winston.error(err);
    //following makes sure another `catch` (reject handler) is called
    return Promise.reject(err);
}

