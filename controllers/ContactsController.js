var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = 'Contacts';

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + mysql.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(Number(req.query.offset));
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
        limitStr += ' LIMIT ' + mysql.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(Number(req.query.offset));
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
    
    var sqls = [];
    var inserted = [];
    
    req.body.contacts.forEach(function (item) {
        var toInsert = {
            account_id: req.body.account_id,
            device_id: item.device_id,
            phone_number: item.phone_number,
            id_matcher: item.id_matcher,
            name: item.name,
            color: item.color,
            color_dark: item.color_dark,
            color_light: item.color_light,
            color_accent: item.color_accent,
            contact_type: item.contact_type
        };
        
        inserted.push(toInsert);
        
        sqls.push("INSERT INTO " + table + db.insertStr(toInsert));
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            var origKeys = ['contact_type'];
            var replaceWith = ['type'];
            
            var msg = util.renameKeys(item, origKeys, replaceWith);
            
            delete msg.device_id;
            delete msg.id_matcher;
            delete msg.account_id;
            
            stream.sendMessage(req.body.account_id, 'added_contact', msg);
        });
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
    
    if (!req.query.device_id) {
        res.json(errors.missingParam);
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
        
        // Send websocket message
        var msg = {
            id: req.query.device_id,
            phone_number: req.body.phone_number,
            name: req.body.name,
            color: req.body.color,
            color_dark: req.body.color_dark,
            color_light: req.body.color_light,
            color_accent: req.body.color_accent
        };
        
        stream.sendMessage(req.query.account_id, 'updated_contact', msg);
    });
});


router.route('/remove_device_id').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.device_id || !req.query.phone_number) {
        res.json(errors.missingParam);
        return;        
    }
    
    var sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + " AND device_id = " + mysql.escape(req.query.device_id);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = util.keepOnlyKeys(req.query, ['device_id', 'phone_number']);
        
        stream.sendMessage(req.query.account_id, 'removed_contact', msg);
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
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'removed_contact_by_id', {
            id: req.params.ids
        });
    });
});


module.exports = router;
 
