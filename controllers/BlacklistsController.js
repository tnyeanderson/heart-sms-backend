var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Blacklists"

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
    
    var cols = ['account_id', 'device_id', 'phone_number', 'phrase'];
    var sqls = [];
    
    req.body.blacklists.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.phone_number),
            mysql.escape(item.phrase)
        ];
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.blacklists.forEach(function (item) {
            var origKeys = ['device_id'];
            
            var newKeys = ['id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            stream.sendMessage(req.body.account_id, 'added_blacklist', msg);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(req.body.account_id, 'removed_blacklist', msg);
    });
});

module.exports = router;
 
