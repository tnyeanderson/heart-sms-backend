var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query.js');
const { v4: uuidv4 } = require('uuid');

router.route('/').get(function (req, res) {
    res.json({
        error: "Not implemented"
    });
});


router.route('/login').get(function (req, res) {
    var sql = "SELECT 1";
    console.log(sql);
    db.query(sql, res, function (result) {
        res.json(result);
    });
});


module.exports = router;
