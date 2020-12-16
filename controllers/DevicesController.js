var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

var table = "Devices"

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
    
    var cols = ['account_id', 'id', 'info', 'name', '`primary`', 'fcm_token'];

    var values = [
        mysql.escape(req.body.account_id),
        mysql.escape(req.body.device.id),
        mysql.escape(req.body.device.info),
        mysql.escape(req.body.device.name),
        mysql.escape(req.body.device.primary),
        mysql.escape(req.body.device.fcm_token)
    ];
    
    sql = "INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")";
        
    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    
    // Update messages sent_device: set to -1
    sqls.push("UPDATE Messages SET sent_device = -1 WHERE sent_device = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(req.query.account_id));
    
    // Remove the device
    sqls.push("DELETE FROM " + table + " WHERE id = " + mysql.escape(Number(req.params.id)) + " AND " + db.whereAccount(req.query.account_id));
    

    db.queries(sqls, res, function (result) {
        res.json({});
    });
});


router.route('/update/:id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        fcm_token: mysql.escape(req.query.fcm_token),
        name: mysql.escape(req.query.name)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE id = " + mysql.escape(req.params.id) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_primary').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.new_primary_device_id) {
        res.json(errors.missingParam);
        return;
    }
    
    var sqls = [];
    
    // Set all devices to primary = false
    sqls.push("UPDATE " + table + " SET `primary` = false WHERE " + db.whereAccount(req.query.account_id));
    
    // Set new primary to primary = true
    sqls.push("UPDATE " + table + " SET `primary` = true WHERE id = " + mysql.escape(Number(req.query.new_primary_device_id)) + " AND " + db.whereAccount(req.query.account_id));

    db.queries(sqls, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
