// get the already promisified Mongoose
var mongoose = require('./database').mongoose;
var Promise = require("bluebird");
var winston = require("winston");

var User = mongoose.model("User");

module.exports = {
    createUser: createUser,
    findOneUser: findOneUser,
    findUsers: findUsers,
    deleteOneUser: deleteOneUser,
    updateOneUser: updateOneUser,
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

