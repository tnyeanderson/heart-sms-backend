const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "Devices"

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }

    let toInsert = {
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
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }

    // Remove the device
    let sql = "DELETE FROM " + table + " WHERE id = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update/:id').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        fcm_token: req.query.fcm_token,
        name: req.query.name
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE id = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_primary').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.new_primary_device_id) {
        res.json(errors.missingParam);
        return;
    }
    
    // Calls the MYSQL stored procedure
    let sql = "CALL UpdatePrimaryDevice(" + mysql.escape(accountId) + ", " + mysql.escape(Number(req.query.new_primary_device_id)) + ")";
    
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'update_primary_device', {
            new_primary_device_id: req.query.new_primary_device_id
        });
    });
});

module.exports = router;
 
