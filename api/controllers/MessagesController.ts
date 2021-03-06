import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as MessagesPayloads from '../models/payloads/MessagesPayloads.js';
import { DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { MessagesAddRequest, MessagesCleanupRequest, MessagesForwardToPhoneRequest, MessagesGetRequest, MessagesUpdateRequest, MessagesUpdateTypeRequest } from '../models/requests/MessagesRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { MessagesListResponse } from '../models/responses/MessagesResponses.js';

const router = express.Router();

const table = 'Messages';

router.route('/').get(
    (req, res, next) => MessagesGetRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MessagesGetRequest = res.locals.request;

        let fields = ['session_id AS account_id', 'id', 'device_id', 
                    'device_conversation_id', 'message_type', 'data', 
                    'timestamp', 'mime_type', 'read', 'seen', 'message_from', 
                    'color', 'sent_device', 'sim_stamp'];

        let whereConversationStr = '';
        
        if (r.conversation_id) {
            whereConversationStr = ` AND device_conversation_id =  ${db.escape(Number(r.conversation_id))} `;
        }

        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ${whereConversationStr} ORDER BY timestamp DESC ${r.limitStr()}`;

        let result = await db.query(sql);
            
        res.json(MessagesListResponse.getList(result));
    }));


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse);

        let payload = new MessagesPayloads.removed_message(
            Number(r.device_id)
        );
        
        // Send websocket message
        payload.send(r.account_id);
    }));


router.route('/add').post(
    (req, res, next) => MessagesAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MessagesAddRequest = res.locals.request;
        
        let items = r.messages.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        let sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(function (item: any) {
            let payload = new MessagesPayloads.added_message(
                item.device_id,
                item.device_conversation_id,
                item.message_type,
                item.data,
                item.timestamp,
                item.mime_type,
                item.read,
                item.seen,
                item.message_from,
                item.color,
                item.sent_device,
                item.sim_stamp
            );
            
            payload.send(r.account_id);
        });
    }));


router.route('/update/:device_id').post(
    (req, res, next) => MessagesUpdateRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MessagesUpdateRequest = res.locals.request;

        let payloadFields = ['device_id AS id', 'message_type AS type', 'timestamp'];

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} RETURNING ${db.selectFields(payloadFields)}`;

        let result = await db.query(sql);

        res.json(new BaseResponse);

        // Send websocket message
        let payload = new MessagesPayloads.updated_message(
            result[0].id,
            result[0].type,
            result[0].timestamp,
            r.read,
            r.seen
        );
        
        payload.send(r.account_id);
    }));


router.route('/update_type/:device_id').post(
    (req, res, next) => MessagesUpdateTypeRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MessagesUpdateTypeRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);
        
        res.json(new BaseResponse);

        let payload = new MessagesPayloads.update_message_type(
            String(r.device_id),
            String(r.message_type)
        )

        // Send websocket message
        payload.send(r.account_id);
    }));


router.route('/cleanup').post(
    (req, res, next) => MessagesCleanupRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MessagesCleanupRequest = res.locals.request;

        let sql = `DELETE FROM ${table} WHERE timestamp < ${db.escape(Number(r.timestamp))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse);

        let payload = new MessagesPayloads.cleanup_messages(
            Number(r.timestamp)
        )
        
        // Send websocket message
        payload.send(r.account_id);
    }));


router.route('/forward_to_phone').post(
    (req, res, next) => MessagesForwardToPhoneRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: MessagesForwardToPhoneRequest = res.locals.request;
        
        let payload = new MessagesPayloads.forward_to_phone(
            String(r.to),
            String(r.message),
            Number(r.sent_device),
            String(r.mime_type),
            Number(r.message_id)
        );
        
        // Send websocket message
        payload.send(r.account_id);
        
        res.json(new BaseResponse);
    });

export default router;
 
