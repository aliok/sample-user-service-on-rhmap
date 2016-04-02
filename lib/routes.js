"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var users = require('./users');


var router = new express.Router();
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.get   ("/users/:username", users.getUserByUsername);
router.delete("/users/:username", users.deleteUserByUsername);

module.exports = router;
