var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');

var table = "ScheduledMessages"

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + "WHERE account_id = '" + mysql.escape(req.query.account_id) + "'";
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/remove/:deviceId').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + "WHERE device_id = '" + mysql.escape(req.params.deviceId) + "' AND account_id = '" + mysql.escape(req.query.account_id) + "'";
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});

module.exports = router;
 
