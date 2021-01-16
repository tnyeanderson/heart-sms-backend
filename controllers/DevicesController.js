var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Devices"

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

    var toInsert = {
        account_id: accountId,
        id: req.body.device.id,
        info: req.body.device.info,
        name: req.body.device.name,
        primary: req.body.device.primary,
        fcm_token: req.body.device.fcm_token
    };
    
    sql = "INSERT INTO " + table + db.insertStr([toInsert]);
        
    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:id').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }

    // Remove the device
    var sql = "DELETE FROM " + table + " WHERE id = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update/:id').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        fcm_token: req.query.fcm_token,
        name: req.query.name
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE id = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_primary').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.new_primary_device_id) {
        res.json(errors.missingParam);
        return;
    }
    
    // Calls the MYSQL stored procedure
    var sql = "CALL UpdatePrimaryDevice(" + mysql.escape(accountId) + ", " + mysql.escape(Number(req.query.new_primary_device_id)) + ")";
    
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'update_primary_device', {
            new_primary_device_id: req.query.new_primary_device_id
        });
    });
});

module.exports = router;
 
