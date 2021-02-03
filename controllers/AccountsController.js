const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const util = require('../utils/util');
const crypto = require('crypto');
const stream = require('./StreamController');

router.route('/').get(function (req, res) {
    res.json(errors.notImplemented);
});

router.route('/login').post(function (req, res) {
    let sql = `SELECT * FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = ${db.escape(req.body.username)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        if (!result[0]) {
            res.status(401).json(errors.auth);
            return;
        }
        
        // Hash password async
        crypto.pbkdf2(req.body.password, result[0].salt1, 100000, 64, 'sha512', (err, derivedHash) => {
            let testhash = derivedHash.toString('hex');

            if (testhash.length && result[0].password_hash == testhash) {
                delete result[0].password_hash;
                delete result[0].username;
    
                // Replace account_id with session_id
                result[0].account_id = result[0].session_id;
                delete result[0].session_id;
    
                res.json(result[0]);
            } else {
                res.status(401).json(errors.auth);
            }
        });
    });
});


router.route('/signup').post(function (req, res) {
    let account_id = util.createAccountId();
    let salt1 = crypto.randomBytes(64).toString('hex');
    let salt2 = crypto.randomBytes(64).toString('hex');

    if (!req.body.name) {
        res.json(errors.missingParam);
        return;
    }

    let validate_username = `SELECT username FROM Accounts WHERE username = ${db.escape(req.body.name)}`;
    
    // Don't do the work to hash the password if the user already exists
    db.query(validate_username, res, function (result) {
        if (result[0] && result[0].username === req.body.name) {
            // User exists
            res.json(errors.duplicateUser);
            return;
        } else {
            doSignup();
        }
    });

    function doSignup() {
        // Create password hash async
        crypto.pbkdf2(req.body.password, salt1, 100000, 64, 'sha512', (err, password_hash) => {
            let values = [
                account_id,
                req.body.name,
                password_hash.toString('hex'),
                salt1,
                salt2,
                req.body.real_name,
                req.body.phone_number
            ];

            let sql = `CALL CreateAccount( ${db.escapeAll(values)} )`;

            db.query(sql, res, function (result) {
                if (result[1] && result[1].affectedRows === 0 && result[0][0].error) {
                    res.json({
                        error: result[0][0].error
                    })
                } else {
                    res.json({
                        account_id: account_id,
                        salt1: salt1,
                        salt2: salt2
                    });
                }
            });
        });
    }
});


router.route('/remove_account').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `DELETE FROM Accounts WHERE ${db.whereAccount(accountId)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        res.json({
            "success": "account deleted"
        });
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_account', {
            id: accountId
        });
    });
});


router.route('/count').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let tables = ["Devices", "Messages", "Conversations", "Drafts", "ScheduledMessages", "Blacklists", "Contacts", "Templates", "Folders", "AutoReplies"];
    let colNames = ["device_count", "message_count", "conversation_count", "draft_count", "scheduled_count", "blacklist_count", "contact_count", "template_count", "folder_count", "auto_reply_count"];
    
    // Use subqueries to count from each table
    let sql = "SELECT ";
    for (let i=0, len=tables.length; i<len; i++) {
        sql += `(SELECT COUNT(*) FROM ${db.escapeId(tables[i])} WHERE ${db.whereAccount(accountId)}) AS ${db.escapeId(colNames[i])}, `;
    }
    // Remove last comma
    sql = sql.substring(0, sql.lastIndexOf(","));
    
    db.query(sql, res, function (result) {
        res.json(result[0]);
    });
});

router.route('/clean_account').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    // Calls the "CleanAccount" mysql stored procedure
    let sql = `CALL CleanAccount( ${db.escape(accountId)} )`;
    
    db.query(sql, res, function (result) {
        res.json({
            "success": "account cleaned"
        });
        
        // Send websocket message
        stream.sendMessage(accountId, 'cleaned_account', {
            id: accountId
        });
    });
});

router.route('/settings').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_to_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];
    
    let sql = `SELECT ${db.selectFields(fields)} FROM Accounts WHERE ${db.whereAccount(accountId)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        res.json(result[0] || null);
    });
});


router.route('/dismissed_notification').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let msg = {
        id: req.query.id,
        device_id: req.query.device_id
    }
    
    stream.sendMessage(accountId, 'dismissed_notification', msg);
    
    res.json({});
});


router.route('/update_subscription').post(function (req, res) {
    // Not implemented because everyone gets a lifetime subscription!
    // Respond for compatibility
    res.json({});
});


module.exports = router;
