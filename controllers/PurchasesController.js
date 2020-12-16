var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

// Not implemented because we don't care about purchases. Everyone has a lifetime subscription.

router.route('/record').post(function (req, res) {
    // Respond for compatibility
    res.json({});
});

module.exports = router;
 
