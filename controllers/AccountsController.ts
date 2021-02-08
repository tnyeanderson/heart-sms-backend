import express from 'express';
import db from '../db/query.js';
import util from '../utils/util.js';
import crypto from 'crypto';
import stream from './StreamController.js';
import users from '../helpers/UserHelper.js';
import * as AccountsPayloads from '../models/payloads/AccountsPayloads.js';
import * as AccountsResponses from '../models/responses/AccountsResponses.js';
import { NotImplementedError, MissingParamError, DuplicateUserError, UserNotAllowedError, AuthError, ErrorResponse } from '../models/responses/ErrorResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BaseRequest } from '../models/requests/BaseRequest.js';

const router = express.Router();

router.route('/').get(function (req, res) {
    res.json(new NotImplementedError);
});

router.route('/login').post(function (req, res) {
    let fields = ['account_id', 'session_id', 'password_hash', 'real_name AS name', 'salt1', 'salt2', 'phone_number', 'base_theme', 'passcode', 'rounder_bubbles', 'use_global_theme', 'apply_primary_color_to_toolbar', 'conversation_categories', 'color', 'color_dark', 'color_light', 'color_accent', 'global_color_theme', 'message_timestamp', 'subscription_type', 'subscription_expiration'];
    let sql = `SELECT ${db.selectFields(fields)} FROM Accounts INNER JOIN SessionMap USING (account_id) INNER JOIN Settings USING (account_id) WHERE username = ${db.escape(req.body.username)} LIMIT 1`;

    db.query(sql, res, function (result) {
        if (!result[0]) {
            res.status(401).json(new AuthError);
            return;
        }
        
        // Hash password async
        crypto.pbkdf2(req.body.password, result[0].salt1, 100000, 64, 'sha512', (err, derivedHash) => {
            let testhash = derivedHash.toString('hex');

            if (testhash.length && result[0].password_hash == testhash) {
                let response = AccountsResponses.LoginResponse.fromResult(result);
    
                res.json(response);
            } else {
                res.status(401).json(new AuthError);
            }
        });
    });
});


router.route('/signup').post(function (req, res) {
    let account_id = util.createAccountId();
    let salt1 = crypto.randomBytes(64).toString('hex');
    let salt2 = crypto.randomBytes(64).toString('hex');

    if (!req.body.name) {
        res.json(new MissingParamError);
        return;
    }

    if (!users.isAllowed(req.body.name)) {
        res.json(new UserNotAllowedError);
        return;
    }

    let validate_username = `SELECT username FROM Accounts WHERE username = ${db.escape(req.body.name)}`;
    
    // Don't do the work to hash the password if the user already exists
    db.query(validate_username, res, function (result) {
        if (result[0] && result[0].username === req.body.name) {
            // User exists
            res.json(new DuplicateUserError);
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
                    res.json(new ErrorResponse(result[0][0].error));
                } else {
                    res.json(new AccountsResponses.SignupResponse(account_id, salt1, salt2));
                }
            });
        });
    }
});


router.route('/remove_account').post(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `DELETE FROM Accounts WHERE ${db.whereAccount(accountId)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        res.json(new AccountsResponses.RemoveAccountResponse());

        let payload = new AccountsPayloads.removed_account(
            accountId
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_account', payload);
    });
});


router.route('/count').get(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
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
        let response = AccountsResponses.CountResponse.fromResult(result);
        res.json(response);
    });
});

router.route('/clean_account').post(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    // Calls the "CleanAccount" mysql stored procedure
    let sql = `CALL CleanAccount( ${db.escape(accountId)} )`;
    
    db.query(sql, res, function (result) {
        res.json(new AccountsResponses.CleanAccountResponse());

        let payload = new AccountsPayloads.cleaned_account(
            accountId
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'cleaned_account', payload);
    });
});

router.route('/settings').get(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    let fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_to_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];
    
    let sql = `SELECT ${db.selectFields(fields)} FROM Settings WHERE ${db.whereAccount(accountId)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        let response = AccountsResponses.SettingsResponse.fromResult(result);
        res.json(response);
    });
});


router.route('/dismissed_notification').post(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    let payload = new AccountsPayloads.dismissed_notification(
        String(req.query.id),
        String(req.query.device_id)
    );
    
    stream.sendMessage(accountId, 'dismissed_notification', payload);
    
    res.json(new BaseResponse);
});


router.route('/update_subscription').post(BaseRequest.validate, function (req, res) {
    // Not implemented because everyone gets a lifetime subscription!
    // Respond for compatibility
    res.json(new BaseResponse);
});


export default router;
