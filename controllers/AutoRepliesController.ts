import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import * as AutoRepliesPayloads from '../models/payloads/AutoRepliesPayloads.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BasePayload } from '../models/payloads/BasePayload.js';
import { AutoRepliesListResponse } from '../models/responses/AutoRepliesResponses.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { AutoRepliesAddRequest, AutoRepliesUpdateRequest } from '../models/requests/AutoRepliesRequests.js';

const router = express.Router();

const table = "AutoReplies"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(AutoRepliesListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => AutoRepliesAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AutoRepliesAddRequest = res.locals.request;

        let inserted = r.auto_replies.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item) {
                let payload = new AutoRepliesPayloads.added_auto_reply(
                    item.device_id,
                    item.reply_type,
                    item.pattern,
                    item.response
                );
                
                payload.send(r.account_id);
            });
        });
    });


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            let payload = new AutoRepliesPayloads.removed_auto_reply(
                Number(r.device_id)
            );

            payload.send(r.account_id);
        });
    });


router.route('/update/:device_id').post(
    (req, res, next) => AutoRepliesUpdateRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AutoRepliesUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BasePayload);

            let payload = new AutoRepliesPayloads.updated_auto_reply(
                Number(r.device_id),
                r.reply_type,
                r.pattern,
                r.response
            );

            payload.send(r.account_id);
        });
    });

export default router;
 
