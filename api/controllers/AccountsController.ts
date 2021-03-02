import crypto from 'crypto';
import express from 'express';
import { QueryResult, QueryResultRow } from 'pg';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as AccountsPayloads from '../models/payloads/AccountsPayloads.js';
import { DismissedNotificationRequest, LoginRequest, SignupRequest, UpdateSettingRequest } from '../models/requests/AccountsRequests.js';
import { AccountIdRequest } from '../models/requests/BaseRequests.js';
import * as AccountsResponses from '../models/responses/AccountsResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { AuthError, ErrorResponse, NotImplementedError } from '../models/responses/ErrorResponses.js';
import util from '../utils/util.js';

const router = express.Router();

router.route('/').get(function (req, res, next) {
    return next(new NotImplementedError);
});

router.route('/login').post(
    (req, res, next) => LoginRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: LoginRequest = res.locals.request;

        let fields = ['account_id', 'session_id', 'password_hash', 'real_name AS name', 'salt1', 'salt2', 'phone_number', 
                      'base_theme', 'passcode', 'rounder_bubbles', 'use_global_theme', 'apply_primary_color_to_toolbar', 
                      'conversation_categories', 'color', 'color_dark', 'color_light', 'color_accent', 'global_color_theme', 
                      'message_timestamp', 'subscription_type', 'subscription_expiration'];
        let sql = `SELECT ${db.selectFields(fields)} FROM Accounts INNER JOIN SessionMap USING (account_id) INNER JOIN Settings USING (account_id) WHERE username = ${db.escape(r.username)} LIMIT 1`;

        let result: QueryResultRow[] = await db.queryP(sql);

        console.log(result);

        if (!result[0]) {
            return next(new AuthError);
        }

        // Hash password async
        crypto.pbkdf2(r.password, result[0].salt1, 100000, 64, 'sha512', (err, derivedHash) => {
            let testhash = derivedHash.toString('hex');
            
            if (testhash.length && result[0].password_hash == testhash) {
                let response = AccountsResponses.LoginResponse.fromResult(result);
            
                res.json(response);
            } else {
                return next(new AuthError);
            }
        });
    }));


router.route('/signup').post(
    (req, res, next) => SignupRequest.handler(req, res, next),
    (req, res, next) => SignupRequest.checkAllowedUser(req, res, next), 
    (req, res, next) => SignupRequest.checkDuplicateUser(req, res, next),
    function (req, res, next) {
        let r: SignupRequest = res.locals.request;

        // Generate 64-character account id and salts
        let account_id = util.createAccountId();
        let salt1 = crypto.randomBytes(64).toString('hex');
        let salt2 = crypto.randomBytes(64).toString('hex');

        // Hash the password with the salt before storing in the database
        crypto.pbkdf2(r.password, salt1, 100000, 64, 'sha512', (err, password_hash) => {
            let values = [
                account_id,
                r.name,
                password_hash.toString('hex'),
                salt1,
                salt2,
                r.real_name,
                r.phone_number
            ];

            let sql = `CALL CreateAccount( ${db.escapeAll(values)} )`;

            db.query(sql, res, function (result) {
                if (result[1] && result[1].affectedRows === 0 && result[0][0].error) {
                    // user already exists, or some other error during the stored procedure
                    return next(new ErrorResponse(result[0][0].error));
                } else {
                    // Signup successful
                    res.json(new AccountsResponses.SignupResponse(account_id, salt1, salt2));
                    return;
                }
            });
        });
    });


router.route('/remove_account').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `DELETE FROM Accounts WHERE ${r.whereAccount()}`;
        
        db.query(sql, res, function (result) {
            let payload = new AccountsPayloads.removed_account(
                r.account_id
            );
            
            // Send websocket message
            payload.send(r.account_id);

            res.json(new BaseResponse);
        });
    });


router.route('/count').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let tables = ["devices", "messages", "conversations", "drafts", "scheduledmessages", "blacklists", "contacts", "templates", "folders", "autoreplies"];
        let colNames = ["device_count", "message_count", "conversation_count", "draft_count", "scheduled_count", "blacklist_count", "contact_count", "template_count", "folder_count", "auto_reply_count"];
        
        // Use subqueries to count from each table
        let sql = "SELECT ";
        for (let i=0, len=tables.length; i<len; i++) {
            sql += `(SELECT COUNT(*) FROM ${tables[i]} WHERE ${r.whereAccount()}) AS ${db.escapeId(colNames[i])}, `;
        }
        // Remove last comma
        sql = sql.substring(0, sql.lastIndexOf(","));

        db.query(sql, res, function (result) {
            let response = AccountsResponses.CountResponse.fromResult(result);
            res.json(response);
        });
    });

router.route('/clean_account').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        // Calls the "CleanAccount" mysql stored procedure
        let sql = `CALL CleanAccount( ${db.escape(r.account_id)} )`;
        
        db.query(sql, res, function (result) {
            let payload = new AccountsPayloads.cleaned_account(
                r.account_id
            );
            
            // Send websocket message
            payload.send(r.account_id);

            res.json(new BaseResponse);
        });
    });

router.route('/settings').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_to_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];
        
        let sql = `SELECT ${db.selectFields(fields)} FROM Settings WHERE ${r.whereAccount()} LIMIT 1`;
        
        db.query(sql, res, function (result) {
            let response = AccountsResponses.SettingsResponse.fromResult(result);
            res.json(response);
        });
    });


router.route('/dismissed_notification').post(
    (req, res, next) => DismissedNotificationRequest.handler(req, res, next),
    function (req, res, next) {
        let r: DismissedNotificationRequest = res.locals.request;
        
        let payload = new AccountsPayloads.dismissed_notification(
            r.id,
            r.device_id
        );
        
        payload.send(r.account_id);
        
        res.json(new BaseResponse);
    });


router.route('/update_subscription').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        // Not implemented because everyone gets a lifetime subscription!
        // Respond for compatibility
        res.json(new BaseResponse);
    });


router.route('/update_setting').post(
    (req, res, next) => UpdateSettingRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: UpdateSettingRequest = res.locals.request;
        
        let castedValue: any;
        
        // Use the "type" property in the request to cast the "value"
        switch(r.type) {
            case 'int':
            case 'long':
                castedValue = Number(r.value);
                break;
            case 'boolean':
                // It might be an actual boolean or a string
                castedValue = (r.value === 'true' || r.value === true) ? true : false;
                break;
            default:
                castedValue = String(r.value);
                break;
        }

        let sql = `UPDATE Settings SET ${db.escapeId(r.pref)} = ${db.escape(castedValue)} WHERE ${r.whereAccount()}`;

        db.query(sql, res, function (result) {

            let payload = new AccountsPayloads.update_setting(
                r.pref,
                r.type,
                castedValue
            );
            
            payload.send(r.account_id);

            res.json(new BaseResponse);
        });

        
    });

export default router;
