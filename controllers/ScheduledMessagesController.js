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
    
    var sql = "SELECT * FROM " + table + " WHERE " + query.whereAccount(req.query.account_id);
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'to', 'data', 'mime_type', 'timestamp', 'title', 'repeat'];
    var sqls = [];
    
    req.body.scheduled_messages.forEach(function (item) {
        var values = [
            db.quote(mysql.escape(item.account_id)),
            mysql.escape(item.device_id),
            db.quote(mysql.escape(item.to)),
            db.quote(mysql.escape(item.mime_type)),
            db.quote(mysql.escape(item.timestamp)),
            db.quote(mysql.escape(item.title)),
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
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + query.whereAccount(req.query.account_id);
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['to', 'data', 'mime_type', 'timestamp', 'title', 'repeat'];
    var values = [
        db.quote(mysql.escape(req.body.to)),
        db.quote(mysql.escape(req.body.data)),
        db.quote(mysql.escape(req.body.mime_type)),
        mysql.escape(req.body.timestamp),
        db.quote(mysql.escape(req.body.title)),
        mysql.escape(req.body.repeat)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + query.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
