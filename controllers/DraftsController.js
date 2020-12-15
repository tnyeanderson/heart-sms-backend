var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');

var table = "Drafts"

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(req.query.account_id);
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
    
    var cols = ['account_id', 'device_id', 'device_conversation_id', 'mime_type', 'data'];
    var sqls = [];
    
    req.body.drafts.forEach(function (item) {
        var values = [
            mysql.escape(item.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.device_conversation_id),
            mysql.escape(item.mime_type),
            mysql.escape(item.data)
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
    
    var cols = ['data', 'mime_type'];
    var values = [
        mysql.escape(req.body.data),
        mysql.escape(req.body.mime_type)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/replace/:deviceConversationId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['device_id', 'device_conversation_id', 'mime_type', 'data'];
    
    var sqls = [];
    
    req.body.drafts.forEach(item => {
        var values = [
            mysql.escape(item.device_id),
            mysql.esacap(item.device_conversation_id),
            mysql.escape(item.mime_type),
            mysql.escape(item.data)
        ];
        sqls.push("UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_conversation_id = " + mysql.escape(req.params.deviceConversationId) + " AND " + db.whereAccount(req.query.account_id));
    });

    db.queries(sqls, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
