var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');

router.route('/').get(function (req, res) {
    var sql = "SELECT 1";
    console.log(sql);
    db.query(sql, res, function (result) {
        res.json(result);
    });
});

module.exports = router;
 
