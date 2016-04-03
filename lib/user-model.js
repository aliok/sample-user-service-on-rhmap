// get the already promisified Mongoose
var mongoose = require("./database").mongoose;

// TODO: better validation here
// TODO: index here
// TODO: unique here

var userSchemaDef = {
    gender: {type: String},
    name: {
        title: {type: String},
        first: {type: String},
        last: {type: String}
    },
    location: {
        street: {type: String},
        city: {type: String},
        state: {type: String},
        zip: {type: Number}
    },
    email: {type: String},
    username: {type: String},
    password: {type: String},
    salt: {type: String},
    md5: {type: String},
    sha1: {type: String},
    sha256: {type: String},
    registered: {type: Number},
    dob: {type: Number},
    phone: {type: String},
    cell: {type: String},
    PPS: {type: String},
    picture: {
        large: {type: String},
        medium: {type: String},
        thumbnail: {type: String}
    }
};

var userSchema = new mongoose.Schema(userSchemaDef);
var userModel = mongoose.model("User", userSchema);

module.exports = userModel;
