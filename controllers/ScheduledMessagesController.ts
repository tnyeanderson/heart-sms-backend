import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as ScheduledMessagesPayloads from '../models/payloads/ScheduledMessagesPayloads.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { ScheduledMessagesListResponse } from '../models/responses/ScheduledMessagesResponses.js';
import { AccountIdRequest, DeviceIdRequest, UpdateDeviceIdRequest } from '../models/requests/BaseRequests.js';
import { ScheduledMessagesAddRequest, ScheduledMessagesUpdateRequest } from '../models/requests/ScheduledMessagesRequests.js';

const router = express.Router();

const table = "ScheduledMessages"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(ScheduledMessagesListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => ScheduledMessagesAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ScheduledMessagesAddRequest = res.locals.request;
        
        let inserted = r.scheduled_messages.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item) {
                let payload = new ScheduledMessagesPayloads.added_scheduled_message(
                    item.device_id,
                    item.to,
                    item.data,
                    item.mime_type,
                    item.timestamp,
                    item.title,
                    item.repeat
                );
                
                payload.send(r.account_id);
            });
        });
    });


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${db.whereAccount(r.account_id)}`;
        

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            let payload = new ScheduledMessagesPayloads.removed_scheduled_message(
                Number(r.device_id)
            );
            
            payload.send(r.account_id);
        });
    });


router.route('/update/:device_id').post(
    (req, res, next) => ScheduledMessagesUpdateRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ScheduledMessagesUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // TODO: This is inefficient. but we need the data
            let fields = ["device_id AS id", "to", "data", "mime_type", "timestamp", "title", "repeat"];
            let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} LIMIT 1`;
            db.query(sql, res, function (result) {
                if (result[0]) {
                    let payload = new ScheduledMessagesPayloads.updated_scheduled_message(
                        result[0].id,
                        result[0].to,
                        result[0].data,
                        result[0].mime_type,
                        result[0].timestamp,
                        result[0].title,
                        result[0].repeat
                    );

                    payload.send(r.account_id);
                }
            });
        });
    });

export default router;
 
