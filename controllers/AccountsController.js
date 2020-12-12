var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

router.route('/').get(function (req, res) {
    res.json(errors.notImplemented);
});


router.route('/login').post(function (req, res) {
    var sql = "SELECT * FROM Accounts WHERE username = '" + mysql.escape(req.body.username) + "' LIMIT 1";
    
    db.query(sql, res, function (result) {
        if (result[0].password_hash == crypto.pbkdf2Sync(req.body.password, result[0].salt1, 100000, 64, 'sha512')) {
            delete result[0].password_hash;
            delete result[0].username;
            res.json(result[0]);
        } else {
            res.json(errors.auth);
        }
    });
});


router.route('/signup').post(function (req, res) {
    var account_id = uuidv4().replace(/-/g, '');
    var salt1 = crypto.randomBytes(256).toString();
    var salt2 = crypto.randomBytes(256).toString();
    var password_hash = crypto.pbkdf2Sync(req.body.password, salt1, 100000, 64, 'sha512');
    
    var values = [account_id, mysql.escape(req.body.name), password_hash, salt1, salt2, mysql.escape(req.body.realName), mysql.escape(req.body.phoneNumber)];
    
    var sql = "INSERT INTO Accounts (account_id, username, password_hash, salt1, salt2, name, phone_number) "
    sql += "VALUES (" + values.join(", ") + ")";
    
    console.log(sql);
    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/remove_account').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM Accounts WHERE " + query.whereAccount(req.query.account_id) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        res.json({
            "success": "account deleted"
        });
    });
});


router.route('/count').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var tables = ["Devices", "Messages", "Conversations", "Drafts", "ScheduledMessages", "Blacklists", "Contacts", "Templates", "Folders", "AutoReplies"];
    var colNames = ["device_count", "message_count", "conversation_count", "draft_count", "scheduled_count", "blacklist_count", "contact_count", "template_count", "template_count", "folder_count", "auto_reply_count"];
    
    // Use subqueries to count from each table
    var sql = "SELECT ";
    for (var i=0, len=tables.length; i<len; i++) {
        sql += "(SELECT COUNT(*) FROM " + tables[i] + " WHERE " + query.whereAccount(req.query.account_id) + ") AS " + colNames[i] + ", ";
    }
    // Remove last comma
    sql = sql.substring(0, sql.lastIndexOf(","));
    
    db.query(sql, res, function (result) {
        res.json(result);
    });
});

router.route('/clean_account').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var tables = ["Messages", "Conversations", "Contacts", "Drafts", "ScheduledMessages", "Blacklists", "Folders", "AutoReplies", "Templates"];
    
    var sql = "DELETE FROM " + tables.join(" ") + " WHERE " + query.whereAccount(req.query.account_id);
    
    db.query(sql, res, function (result) {
        res.json({
            "success": "account cleaned"
        });
    });
});

router.route('/settings').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_to_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];
    
    var sql = "SELECT " + fields.join(", ") + " FROM Accounts WHERE " + query.whereAccount(req.query.account_id) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        res.json(result[0]);
    });
});


module.exports = router;
