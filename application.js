var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var cors = require('cors');
var winston = require("winston");
var Promise = require("bluebird");

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

// Important that this is last!
app.use(mbaasExpress.errorHandler());

module.exports = {};

var server;

module.exports.start = function (host, port) {
    return new Promise(function (fulfill, reject) {
        server = app.listen(port, host, function (err) {
            if (err) {
                return reject(err);
            }
            else {
                return fulfill(app);
            }
        });

    });
};

module.exports.stop = function () {
    return new Promise(function (fulfill, reject) {
        server.close(function (err) {
            if (err) {
                return reject(err);
            }
            else {
                return fulfill(app);
            }
        });
    });
};

