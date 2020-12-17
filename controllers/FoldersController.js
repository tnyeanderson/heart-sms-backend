var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Folders"

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
    
    var cols = ['account_id', 'device_id', 'name', 'color', 'color_dark', 'color_light', 'color_accent'];
    var sqls = [];
    
    req.body.folders.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.name),
            mysql.escape(item.color),
            mysql.escape(item.color_dark),
            mysql.escape(item.color_light),
            mysql.escape(item.color_accent)
        ];
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.folders.forEach(function (item) {
            var toKeep = ['device_id', 'name', 'color', 'color_dark', 'color_light', 'color_accent'];
            
            var msg = util.keepOnlyKeys(item, toKeep);
            
            stream.sendMessage(req.body.account_id, 'added_folder', msg);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    
    // Update conversations to remove from folder
    sqls.push("UPDATE Conversations SET folder_id = -1 WHERE folder_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id));
    
    // Delete the folder
    sqls.push("DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id));
    

    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'removed_folder', {
            id: req.params.deviceId
        });
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        name: mysql.escape(req.body.name),
        color: mysql.escape(req.body.color),
        color_dark: mysql.escape(req.body.color_dark),
        color_light: mysql.escape(req.body.color_light),
        color_accent: mysql.escape(req.body.color_accent)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var toKeep = ['name', 'color', 'color_dark', 'color_light', 'color_accent'];
            
        var msg = util.keepOnlyKeys(req.body, toKeep);
        
        msg.device_id = Number(req.params.deviceId);
            
        stream.sendMessage(req.body.account_id, 'updated_folder', msg);
    });
});

module.exports = router;
 
