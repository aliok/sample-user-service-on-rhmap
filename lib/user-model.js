// get the already promisified Mongoose
var mongoose = require("./database").mongoose;

// SAMPLE user object
// var x = {
//     "user": {
//         "gender": "female",
//         "name": {
//             "title": "miss",
//             "first": "alison",
//             "last": "reid"
//         },
//         "location": {
//             "street": "1097 the avenue",
//             "city": "Newbridge",
//             "state": "ohio",
//             "zip": 28782
//         },
//         "email": "alison.reid@example.com",
//         "username": "tinywolf709",
//         "password": "rockon",
//         "salt": "lypI10wj",
//         "md5": "bbdd6140e188e3bf68ae7ae67345df65",
//         "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
//         "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
//         "registered": 1237176893,
//         "dob": 932871968,
//         "phone": "031-541-9181",
//         "cell": "081-647-4650",
//         "PPS": "3302243T",
//         "picture": {
//             "large": "https://randomuser.me/api/portraits/women/60.jpg",
//             "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
//             "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
//         }
//     }
// };

// TODO: better validation here
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
    registered: {type: String},
    dob: {type: String},
    phone: {type: String},
    cell: {type: String},
    PPS: {type: String}
};

var userSchema = new mongoose.Schema(userSchemaDef);
var userModel = mongoose.model("User", userSchema);

module.exports = userModel;
