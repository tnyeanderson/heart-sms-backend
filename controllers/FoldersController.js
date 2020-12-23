var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Folders"

router.route('/').get(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    var inserted = [];
    
    req.body.folders.forEach(function (item) {
        var toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            name: item.name,
            color: item.color,
            color_dark: item.color_dark,
            color_light: item.color_light,
            color_accent: item.color_accent
        };
        
        inserted.push(toInsert);
        
        sqls.push("INSERT INTO " + table + db.insertStr(toInsert));
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            delete item.account_id;
            
            stream.sendMessage(accountId, 'added_folder', item);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    // Delete the folder
    sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_folder', {
            id: req.params.deviceId
        });
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        name: req.body.name,
        color: req.body.color,
        color_dark: req.body.color_dark,
        color_light: req.body.color_light,
        color_accent: req.body.color_accent
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var toKeep = ['name', 'color', 'color_dark', 'color_light', 'color_accent'];
            
        var msg = util.keepOnlyKeys(req.body, toKeep);
        
        msg.device_id = Number(req.params.deviceId);
            
        stream.sendMessage(accountId, 'updated_folder', msg);
    });
});

module.exports = router;
 
