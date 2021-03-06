var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var morgan = require("morgan");

var userApi = require('./user-api');


var router = new express.Router();

// enable cors on routes starting with /api
router.use(cors());

// middleware to get meaningful data from requests
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

// access log
router.use(morgan("dev"));


// define routes
router.get   ("/users",           userApi.getAllUsers);
router.post  ("/users",           userApi.createUser);
router.get   ("/users/:username", userApi.getUserByUsername);
router.delete("/users/:username", userApi.deleteUserByUsername);
router.put   ("/users/:username", userApi.updateUserByUsername);
router.patch ("/users/:username", userApi.patchUserByUsername);
router.post  ("/search/users",    userApi.searchUsers);


/**
 * Defines and configures API available routes.
 *
 * @module lib/routes
 */
module.exports = router;
