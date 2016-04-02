var winston = require('winston');

var host = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var port = process.env.FH_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001;

var application = require("./application");

application
    .start(host, port)
    .then(function () {
        winston.info("App started at: " + new Date() + " on port: " + port);
    })
    .catch(function (err) {
        winston.error(err);
        process.exit(0);
    });
