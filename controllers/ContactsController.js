var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

var table = 'Contacts';

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + req.query.limit;
        if (req.query.offset) {
            limitStr += ' OFFSET ' + req.query.offset;
        }
    }
    
    var cols = ['id', 'account_id', 'device_id', 'phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type'];
    
    var sql = "SELECT " + cols.join(', ') + " FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});

router.route('/simple').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + mysql.escape(req.query.limit);
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(req.query.offset);
        }
    }
    
    var cols = ['phone_number', 'name', 'id', 'id_matcher', 'color', 'color_accent', 'contact_type'];
    
    var sql = "SELECT " + cols.join(', ') + " FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'phone_number', 'id_matcher', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type'];
    var sqls = [];
    
    req.body.messages.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.phone_number),
            mysql.escape(item.id_matcher),
            mysql.escape(item.name),
            mysql.escape(item.color),
            mysql.escape(item.color_dark),
            mysql.escape(item.color_light),
            mysql.escape(item.color_accent),
            mysql.escape(item.contact_type)
        ];
        
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
    });
});


router.route('/clear').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_device_id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        phone_number: mysql.escape(req.body.phone_number),
        name: mysql.escape(req.body.name),
        color: mysql.escape(req.body.color),
        color_dark: mysql.escape(req.body.color_dark),
        color_light: mysql.escape(req.body.color_light),
        color_accent: mysql.escape(req.body.color_accent)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(req.query.device_id) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove_device_id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.device_id) {
        res.json(errors.missingParam);
        return;        
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.query.device_id) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove_ids/:ids').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var whereId = [];
    var idList = req.params.ids.split(',');
    
    idList.forEach(id => {
        whereId.push('id = ' + mysql.escape(Number(id)));
    });
    
    var sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + " AND (" + whereId.join(' OR ') + ")";

    db.query(sql, res, function (result) {
        res.json({});
    });
});


module.exports = router;
 
