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
    
    var cols = ['account_id', 'id', 'info', 'name', 'primary', 'fcm_token'];
    var sqls = [];
    
    req.body.devices.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.id),
            mysql.escape(item.info),
            mysql.escape(item.name),
            mysql.escape(item.primary),
            mysql.escape(item.fcm_token)
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


router.route('/update/:id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['fcm_token', 'name'];
    var values = [
        mysql.escape(req.query.fcm_token),
        mysql.escape(req.query.name)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE id = " + mysql.escape(req.params.id) + " AND " + db.whereAccount(req.query.account_id);
    

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
    sqls.push("UPDATE " + table + " SET primary = false WHERE " + db.whereAccount(req.query.account_id));
    
    // Set new primary to primary = true
    sqls.push("UPDATE " + table + " SET primary = true WHERE id = " + mysql.escape(req.query.new_primary_device_id) + " AND " + db.whereAccount(req.query.account_id));

    db.query(sql, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
