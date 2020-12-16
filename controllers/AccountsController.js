var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var util = require('../utils/util');
const crypto = require('crypto');
var stream = require('./StreamController');

router.route('/').get(function (req, res) {
    res.json(errors.notImplemented);
});


router.route('/login').post(function (req, res) {
    var sql = "SELECT * FROM Accounts WHERE username = " + mysql.escape(req.body.username) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        if (!result[0]) {
            res.json(errors.auth);
            return;
        }
        
        var testhash = crypto.pbkdf2Sync(req.body.password, result[0].salt1, 100000, 64, 'sha512').toString('hex');
        if (result[0].password_hash == testhash) {
            delete result[0].password_hash;
            delete result[0].username;
            res.json(result[0]);
        } else {
            res.json(errors.auth);
        }
    });
});


router.route('/signup').post(function (req, res) {
    var account_id = util.createAccountId();
    var salt1 = crypto.randomBytes(64).toString('hex');
    var salt2 = crypto.randomBytes(64).toString('hex');
    var password_hash = crypto.pbkdf2Sync(req.body.password, salt1, 100000, 64, 'sha512').toString('hex');
    
    var values = [
        db.quote(account_id),
        mysql.escape(req.body.name), 
        db.quote(password_hash), 
        db.quote(salt1), 
        db.quote(salt2), 
        mysql.escape(req.body.real_name), 
        mysql.escape(req.body.phone_number)
    ];
    
    var sql = "INSERT INTO Accounts (account_id, username, password_hash, salt1, salt2, real_name, phone_number) "
    sql += "VALUES (" + values.join(", ") + ")";
    
    
    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove_account').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM Accounts WHERE " + db.whereAccount(req.query.account_id) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        res.json({
            "success": "account deleted"
        });
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'removed_account', {
            id: req.query.account_id
        });
    });
});


router.route('/count').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var tables = ["Devices", "Messages", "Conversations", "Drafts", "ScheduledMessages", "Blacklists", "Contacts", "Templates", "Folders", "AutoReplies"];
    var colNames = ["device_count", "message_count", "conversation_count", "draft_count", "scheduled_count", "blacklist_count", "contact_count", "template_count", "folder_count", "auto_reply_count"];
    
    // Use subqueries to count from each table
    var sql = "SELECT ";
    for (var i=0, len=tables.length; i<len; i++) {
        sql += "(SELECT COUNT(*) FROM " + tables[i] + " WHERE " + db.whereAccount(req.query.account_id) + ") AS " + colNames[i] + ", ";
    }
    // Remove last comma
    sql = sql.substring(0, sql.lastIndexOf(","));
    
    db.query(sql, res, function (result) {
        res.json(result[0]);
    });
});

router.route('/clean_account').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var tables = ["Messages", "Conversations", "Contacts", "Drafts", "ScheduledMessages", "Blacklists", "Folders", "AutoReplies", "Templates"];
    
    
    var sqls = []
    
    tables.forEach(table => {
        sqls.push("DELETE FROM " + table + " WHERE " + db.whereAccount(req.query.account_id));
    });
    
    db.queries(sqls, res, function (result) {
        res.json({
            "success": "account cleaned"
        });
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'cleaned_account', {
            id: req.query.account_id
        });
    });
});

router.route('/settings').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_to_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];
    
    var sql = "SELECT " + fields.join(", ") + " FROM Accounts WHERE " + db.whereAccount(req.query.account_id) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        res.json(result[0] || null);
    });
});


router.route('/dismissed_notification').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var msg = {
        id: req.query.id,
        device_id: req.query.device_id
    }
    
    stream.sendMessage(req.query.account_id, 'dismissed_notification', msg);
    
    res.json({});
});


router.route('/update_subscription').post(function (req, res) {
    // Not implemented because everyone gets a lifetime subscription!
    // Respond for compatibility
    res.json({});
});


module.exports = router;
