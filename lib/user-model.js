// get the promisified Mongoose
var mongoose = require("./database").mongoose;

// TODO: better validation here
// TODO: index here
// TODO: unique here

var userSchemaDef = {
    gender: {type: String, enum: ['male', 'female']},
    name: {
        title: {type: String, maxlength: 50},
        first: {type: String, maxlength: 50},
        last: {type: String, maxlength: 50}
    },
    location: {
        street: {type: String, max: 100},
        city: {type: String, max: 100},
        state: {type: String, max: 100},
        zip: {type: Number, min: 0, max: 99999}
    },
    email: {type: String, max: 200},
    username: {type: String, max: 100, required:true},
    password: {type: String, max: 100},
    salt: {type: String, max: 100},
    md5: {type: String, max: 100},
    sha1: {type: String, max: 100},
    sha256: {type: String, max: 100},
    registered: {type: Number, min: 0},
    dob: {type: Number, min: 0},
    phone: {type: String, max: 100},
    cell: {type: String, max: 100},
    PPS: {type: String, max: 100},
    picture: {
        large: {type: String, max: 500},
        medium: {type: String, max: 500},
        thumbnail: {type: String, max: 500}
    }
};

// strict:throw --> don't allow anything not defined in the schema
var userSchema = new mongoose.Schema(userSchemaDef, {strict: 'throw'});
userSchema.index({username: 1}, {unique: true});

var userModel = mongoose.model("User", userSchema);

module.exports = userModel;
