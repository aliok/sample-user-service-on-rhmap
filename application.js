var express = require('express');
var cors = require('cors');
var winston = require("winston");
var Promise = require("bluebird");

var database = require('./lib/database');

module.exports = {};

// If the Node process ends, close the Mongoose connection
//noinspection ES6ModulesDependencies
process
    .on("SIGINT", gracefulExit)
    .on("SIGTERM", gracefulExit);

var server;

module.exports.start = function (host, port) {
    if (server) {
        throw new Error("Application already started");
    }

    return new Promise(function (fulfill, reject) {
        database.connect(function (err) {
            if (err) {
                winston.error(err);
                return reject(err);
            }
            
            var app = createApp();

            server = app.listen(port, host, function (err) {
                if (err) {
                    server = null;
                    return reject(err);
                }
                else {
                    return fulfill({
                        server: server,
                        app: app
                    });
                }
            });

        });
    });
};

module.exports.stop = function () {
    if (!server) {
        throw new Error("Application is not running");
    }

    return new Promise(function (fulfill, reject) {
        server.close(function (err) {
            server = null;
            if (err) {
                return reject(err);
            }
            else {
                database.disconnect(function () {
                    return fulfill();
                });
            }
        });
    });
};

function createApp() {
    // these 2 fellas make the node instance running forever
    // that is why they're imported later.
    var mbaasApi = require('fh-mbaas-api');
    var mbaasExpress = mbaasApi.mbaasExpress();
    
    // RHMAP securable endpoints
    var securableEndpoints = ['/api'];


    var app = express();

    // Enable CORS for all requests
    app.use(cors());

    // Note: the order which we add middleware to Express here is important!
    app.use('/sys', mbaasExpress.sys(securableEndpoints));
    app.use('/mbaas', mbaasExpress.mbaas);

    // allow serving of static files from the public directory
    app.use(express.static(__dirname + '/public'));

    // Note: important that this is added just before your own Routes
    app.use(mbaasExpress.fhmiddleware());

    app.use('/api', require('./lib/routes.js'));

    // // TODO: not sure about this one. maybe it messes up something in RHMAP?
    // // register a 404 handler
    app.use(function (req, res) {
        res.status(404).json("Sorry cant find that!");
    });

    // Important that this is last!
    app.use(mbaasExpress.errorHandler());

    return app;
}


function gracefulExit() {
    database.disconnect(function () {
        winston.info("Mongoose default connection disconnected through app termination");
        process.exit(0);
    });
}
