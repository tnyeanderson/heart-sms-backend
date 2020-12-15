var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

var table = "ScheduledMessages"

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', '`to`', '`data`', 'mime_type', '`timestamp`', 'title', '`repeat`'];
    var sqls = [];
    
    req.body.scheduled_messages.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.to),
            mysql.escape(item.data),
            mysql.escape(item.mime_type),
            mysql.escape(item.timestamp),
            mysql.escape(item.title),
            mysql.escape(item.repeat)
        ];
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        to: mysql.escape(req.body.to),
        data: mysql.escape(req.body.data),
        mime_type: mysql.escape(req.body.mime_type),
        timestamp: mysql.escape(req.body.timestamp),
        title: mysql.escape(req.body.title),
        repeat: mysql.escape(req.body.repeat)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
