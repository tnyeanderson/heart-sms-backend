import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as ConversationsPayloads from '../models/payloads/ConversationsPayloads.js';
import { AccountIdRequest, DeviceIdRequest, LimitOffsetRequest } from '../models/requests/BaseRequests.js';
import { ConversationsAddRequest, ConversationsAddToFolderRequest, ConversationsCleanupMessagesRequest, ConversationsFolderRequest, ConversationsReadRequest, ConversationsSeenRequest, ConversationsUpdateRequest, ConversationsUpdateSnippetRequest, ConversationsUpdateTitleRequest } from '../models/requests/ConversationsRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { ConversationsListResponse } from '../models/responses/ConversationsResponses.js';

const router = express.Router();

const table = 'Conversations'

const fields = ['session_id AS account_id', 'id', 'device_id', 'folder_id', 
            'color', 'color_dark', 'color_light', 'color_accent', 'led_color', 
            'pinned', 'read', 'timestamp', 'title', 'phone_numbers', 'snippet', 
            'ringtone', 'image_uri', 'id_matcher', 'mute', 'archive', 'private_notifications'];

const notInFolder = " (folder_id IS NULL OR folder_id < 0) ";

router.route('/').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/index_archived').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE archive = true AND ${notInFolder} AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/index_private').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE private_notifications = true AND ${notInFolder} AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/index_public_unarchived').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE archive = false AND private_notifications = false AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/index_public_unread').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${db.escapeId("read")} = false AND private_notifications = false AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/:device_id').get(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} LIMIT 1`;

        const result = await db.query(sql);
            
        res.json(ConversationsListResponse.fromResult(result));
    }));


router.route('/folder/:folder_id').get(
    (req, res, next) => ConversationsFolderRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsFolderRequest = res.locals.request;
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE folder_id = ${db.escape(Number(r.folder_id))} AND ${r.whereAccount()}`;

        const result = await db.query(sql);
        
        res.json(ConversationsListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => ConversationsAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsAddRequest = res.locals.request;
        
        const items = r.conversations.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        const sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(function (item) {
            const payload = new ConversationsPayloads.added_conversation(
                item.device_id,
                item.folder_id,
                item.color,
                item.color_dark,
                item.color_light,
                item.color_accent,
                item.led_color,
                item.pinned,
                item.read,
                item.timestamp,
                item.title,
                item.phone_numbers,
                item.snippet,
                item.id_matcher,
                item.mute,
                item.archive,
                item.private_notifications,
                item.ringtone,
                item.image_uri
            );
            
            payload.send(r.account_id);
        });
    }));


router.route('/update/:device_id').post(
    (req, res, next) => ConversationsUpdateRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: ConversationsUpdateRequest = res.locals.request;

        const payloadFields = ["device_id AS id", "color", "color_dark", "color_light", "color_accent", "led_color", "pinned", "read", "title", "snippet", "ringtone", "mute", "archive", "private_notifications"];

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} RETURNING ${db.selectFields(payloadFields)}`;

        const result = await db.query(sql);

        res.json(new BaseResponse)

        const payload = new ConversationsPayloads.updated_conversation(
            result[0].id,
            result[0].color,
            result[0].color_dark,
            result[0].color_light,
            result[0].color_accent,
            result[0].led_color,
            result[0].pinned,
            result[0].read,
            result[0].title,
            result[0].snippet,
            result[0].mute,
            result[0].archive,
            result[0].private_notifications,
            result[0].ringtone
        );

        payload.send(r.account_id);
    }));


router.route('/update_snippet/:device_id').post(
    (req, res, next) => ConversationsUpdateSnippetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsUpdateSnippetRequest = res.locals.request;

        const payloadFields = ["device_id AS id", "read", "timestamp", "snippet", "archive"];

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} RETURNING ${db.selectFields(payloadFields)}`;

        const result = await db.query(sql);

        res.json(new BaseResponse)

        const payload = new ConversationsPayloads.update_conversation_snippet(
            result[0].id,
            result[0].read,
            result[0].timestamp,
            result[0].snippet,
            result[0].archive
        );

        payload.send(r.account_id);
    }));


router.route('/update_title/:device_id').post(
    (req, res, next) => ConversationsUpdateTitleRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsUpdateTitleRequest = res.locals.request;

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);
        
        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.update_conversation_title(
            Number(r.device_id),
            String(r.title)
        );
        
        payload.send(r.account_id);
    }));


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.removed_conversation(
            Number(r.device_id)
        );
        
        payload.send(r.account_id);
    }));


router.route('/read/:device_id').post(
    (req, res, next) => ConversationsReadRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsReadRequest = res.locals.request;
        
        const sql = `UPDATE ${table} SET ${db.escapeId("read")} = true WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.read_conversation(
            Number(r.device_id),
            // Don't cast to 'undefined' by accident
            (r.android_device) ? String(r.android_device) : undefined
        );
        
        payload.send(r.account_id);
    }));


router.route('/seen/:device_conversation_id').post(
    (req, res, next) => ConversationsSeenRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsSeenRequest = res.locals.request
        
        const sql = `UPDATE Messages SET seen = true WHERE device_conversation_id = ${db.escape(Number(r.device_conversation_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.seen_conversation(
            Number(r.device_conversation_id)
        );
        payload.send(r.account_id);
        
    }));


router.route('/seen').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;
        
        const sql = `UPDATE Messages SET seen = true WHERE ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        const payload = new ConversationsPayloads.seen_conversations();

        // Send websocket message
        payload.send(r.account_id);
    }));


router.route('/archive/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `UPDATE ${table} SET archive = true, folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.archive_conversation(
            Number(r.device_id),
            true
        );
        
        payload.send(r.account_id);
    }));


router.route('/unarchive/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `UPDATE ${table} SET archive = false, folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.archive_conversation(
            Number(r.device_id),
            false
        );
        
        payload.send(r.account_id);
    }));


router.route('/add_to_folder/:device_id').post(
    (req, res, next) => ConversationsAddToFolderRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsAddToFolderRequest = res.locals.request;

        const sql = `UPDATE ${table} SET folder_id = ${db.escape(Number(r.folder_id))} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.add_conversation_to_folder(
            Number(r.device_id),
            Number(r.folder_id)
        );
        
        payload.send(r.account_id);
    }));


router.route('/remove_from_folder/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `UPDATE ${table} SET folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)

        // Send websocket message
        const payload = new ConversationsPayloads.remove_conversation_from_folder(
            Number(r.device_id)
        );
        
        payload.send(r.account_id);
    }));


router.route('/cleanup_messages').post(
    (req, res, next) => ConversationsCleanupMessagesRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ConversationsCleanupMessagesRequest = res.locals.request;
    
        const sql = `DELETE FROM Messages WHERE device_conversation_id = ${db.escape(Number(r.conversation_id))} AND timestamp < ${db.escape(Number(r.timestamp))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse)
        
        const payload = new ConversationsPayloads.cleanup_conversation_messages(
            Number(r.timestamp),
            String(r.conversation_id)
        );

        // Send websocket message
        payload.send(r.account_id);
    }));

export default router;
 
