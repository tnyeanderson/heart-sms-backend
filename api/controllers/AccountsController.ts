import crypto from 'crypto';
import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import { hashPassword } from '../helpers/CryptoHelper.js';
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
        const r: LoginRequest = res.locals.request;

        const fields = ['account_id', 'session_id', 'password_hash', 'real_name AS name', 'salt1', 'salt2', 'phone_number',
                      'base_theme', 'passcode', 'rounder_bubbles', 'use_global_theme', 'apply_primary_color_toolbar',
                      'conversation_categories', 'color', 'color_dark', 'color_light', 'color_accent', 'global_color_theme',
                      'message_timestamp', 'subscription_type', 'subscription_expiration'];

        const sql = `SELECT ${db.selectFields(fields)} FROM Accounts INNER JOIN SessionMap USING (account_id) INNER JOIN Settings USING (account_id) WHERE username = ${db.escape(r.username)} LIMIT 1`;

        const result = await db.query(sql);

        if (!result[0]) {
            return next(new AuthError);
        }

        const testHash = await hashPassword(r.password, result[0].salt1);

        if (testHash.length && result[0].password_hash == testHash) {
            const response = AccountsResponses.LoginResponse.fromResult(result);
            res.json(response);
        } else {
            return next(new AuthError);
        }
    }));


router.route('/signup').post(
    (req, res, next) => SignupRequest.handler(req, res, next),
    (req, res, next) => SignupRequest.checkAllowedUser(req, res, next),
    asyncHandler(SignupRequest.checkDuplicateUser),
    asyncHandler(async (req, res, next) => {
        const r: SignupRequest = res.locals.request;

        // Generate 64-character account id and salts
        const account_id = util.createAccountId();
        const salt1 = crypto.randomBytes(64).toString('hex');
        const salt2 = crypto.randomBytes(64).toString('hex');

        const passwordHash = await hashPassword(r.password, salt1);

        const values = [
            account_id,
            r.name,
            passwordHash,
            salt1,
            salt2,
            r.real_name,
            r.phone_number
        ];

        const sql = `CALL CreateAccount( ${db.escapeAll(values)} )`;

        const result = await db.query(sql);

        if (result[1] && result[1].affectedRows === 0 && result[0][0].error) {
            // user already exists, or some other error during the stored procedure
            return next(new ErrorResponse(result[0][0].error));
        } else {
            // Signup successful
            res.json(AccountsResponses.SignupResponse.fromResult([{account_id, salt1, salt2}]));
            return;
        }
    }));


router.route('/remove_account').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;

        const sql = `DELETE FROM Accounts WHERE ${r.whereAccount()}`;

        await db.query(sql);

        const payload = new AccountsPayloads.removed_account(
            r.account_id
        );

        // Send websocket message
        payload.send(r.account_id);

        res.json(new BaseResponse);
    }));


router.route('/count').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;

        const fields = ["device_count", "message_count", "conversation_count", "draft_count", "scheduled_count", "blacklist_count", "contact_count", "template_count", "folder_count", "auto_reply_count"];

        const sql = `SELECT ${db.selectFields(fields)} from CountsView where ${r.whereAccount()}`;

        const result = await db.query(sql);

        // If the account doesn't exist (and response is null), return an empty object
        if (!result || (Array.isArray(result) && result.length === 0)) {
            return res.json({});
        }

        const response = AccountsResponses.CountResponse.fromResult(result);

        res.json(response);
    }));

router.route('/clean_account').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;

        // Calls the "CleanAccount" mysql stored procedure
        const sql = `CALL CleanAccount( ${db.escape(r.account_id)} )`;

        await db.query(sql);

        const payload = new AccountsPayloads.cleaned_account(
            r.account_id
        );

        // Send websocket message
        payload.send(r.account_id);

        res.json(new BaseResponse);
    }));

router.route('/settings').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;

        const fields = ["base_theme", "global_color_theme", "rounder_bubbles", "color", "color_dark", "color_light", "color_accent", "use_global_theme", "apply_primary_color_toolbar", "passcode", "subscription_type", "message_timestamp", "conversation_categories"];

        const sql = `SELECT ${db.selectFields(fields)} FROM Settings WHERE ${r.whereAccount()} LIMIT 1`;

        const result = await db.query(sql);

        const response = AccountsResponses.SettingsResponse.fromResult(result);

        res.json(response);
    }));


router.route('/dismissed_notification').post(
    (req, res, next) => DismissedNotificationRequest.handler(req, res, next),
    function (req, res) {
        const r: DismissedNotificationRequest = res.locals.request;

        const payload = new AccountsPayloads.dismissed_notification(
            r.id,
            r.device_id
        );

        payload.send(r.account_id);

        res.json(new BaseResponse);
    });


router.route('/update_subscription').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    function (req, res) {
        // Not implemented because everyone gets a lifetime subscription!
        // Respond for compatibility
        res.json(new BaseResponse);
    });


router.route('/update_setting').post(
    (req, res, next) => UpdateSettingRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: UpdateSettingRequest = res.locals.request;

        let castedValue: number | string | boolean;

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

        const sql = `UPDATE Settings SET ${db.escapeId(r.pref)} = ${db.escape(castedValue)} WHERE ${r.whereAccount()}`;

        await db.query(sql);

        const payload = new AccountsPayloads.update_setting(
            r.pref,
            r.type,
            castedValue
        );

        payload.send(r.account_id);

        res.json(new BaseResponse);
    }));

export default router;
