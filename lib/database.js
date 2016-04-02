// Bring Mongoose into the app.
// see http://theholmesoffice.com/mongoose-connection-best-practice/
// Bluebird suggests that it is better to promisify Mongoose
// than using Mongoose's
// see http://bluebirdjs.com/docs/working-with-callbacks.html#mongoose
var bluebird = require("bluebird");
var mongoose = bluebird.promisifyAll(require("mongoose"));
var mongodbUri = require('mongodb-uri');
var winston = require('winston');

module.exports = {};
// export this ASAP since imported user-model uses the exports
module.exports.mongoose = mongoose;


// load these. order is important!
require('./user-model');
require('./user-dao');


var connectionString = buildConnectionString();

module.exports = {
    connect: connect,
    disconnect: disconnect
};

function connect(callback) {
    if(!connectionString){
        return callback(new Error("MongoDB connection string cannot be built. Pass the required environment variables."));
    }

    mongoose.connection.on("connected", function () {
        winston.info("Mongoose default connection open to %s", connectionString);
        callback(null);
    });

    // If the DB connection throws an error
    mongoose.connection.on("error", function (err) {
        winston.error("Mongoose default connection error", err);
    });

    // When the DB connection is disconnected
    mongoose.connection.on("disconnected", function () {
        winston.info("Mongoose default connection disconnected");
    });

    try {
        mongoose.connect(connectionString);
        winston.info("Trying to connect to ", connectionString);
    } catch (err) {
        winston.error("Database connection failed ", err.message);
        callback(err);
    }
}

function disconnect(callback) {
    mongoose.disconnect(callback);
}

function buildConnectionString() {
    // FOLLOWING CODE is copied from fh-mbaas-api/lib/db.js
    //
    // if we're running on OpenShift, then ensure that our FH_MONGODB_CONN_URL envvar is set when the module is loaded
    // Some client apps e.g. Our generic Welcome app, use the presense of the envvar to indicate whether direct database calls can be made
    // Support for openshift 2 (on the left )& 3 (on the right)
    // Support for openshift 2 (on the left )& 3 (on the right)
    if (process.env.OPENSHIFT_MONGODB_DB_HOST || process.env.MONGODB_SERVICE_HOST) {
        var
            host = process.env.OPENSHIFT_MONGODB_DB_HOST || process.env.MONGODB_SERVICE_HOST,
            user = process.env.OPENSHIFT_MONGODB_DB_USERNAME || process.env.MONGODB_USER,
            pass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || process.env.MONGODB_PASSWORD,
            port = process.env.OPENSHIFT_MONGODB_DB_PORT || process.env.MONGODB_SERVICE_PORT,
            dbname = process.env.OPENSHIFT_APP_NAME || process.env.MONGODB_DATABASE;

        return mongodbUri.format({
            username: user,
            password: pass,
            hosts: [
                {
                    host: host,
                    port: port
                }
            ],
            database: dbname
        });
    }
    else {
        return undefined;
    }
}
