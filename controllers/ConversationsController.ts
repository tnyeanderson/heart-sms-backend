import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as ConversationsPayloads from '../models/payloads/ConversationsPayloads.js';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { ConversationsListResponse } from '../models/responses/ConversationsResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { AccountIdRequest, DeviceIdRequest, LimitOffsetRequest } from '../models/requests/BaseRequests.js';
import { ConversationsAddRequest, ConversationsUpdateRequest, ConversationsFolderRequest, ConversationsUpdateSnippetRequest, ConversationsUpdateTitleRequest, ConversationsReadRequest, ConversationsSeenRequest, ConversationsAddToFolderRequest, ConversationsCleanupMessagesRequest } from '../models/requests/ConversationsRequests.js';

const router = express.Router();

const table = 'Conversations'

const notInFolder = " (folder_id IS NULL OR folder_id < 0) ";

router.route('/').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: LimitOffsetRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/index_archived').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE archive = true AND ${notInFolder} AND ${r.whereAccount()} ORDER BY timestamp DESC`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/index_private').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE private_notifications = true AND ${notInFolder} AND ${r.whereAccount()} ORDER BY timestamp DESC`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/index_public_unarchived').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: LimitOffsetRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE archive = false AND private_notifications = false AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/index_public_unread').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: LimitOffsetRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${db.escapeId("read")} = false AND private_notifications = false AND ${r.whereAccount()} ORDER BY timestamp DESC ${r.limitStr()}`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/:device_id').get(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} LIMIT 1`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.fromResult(result));
        });
    });


router.route('/folder/:folder_id').get(
    (req, res, next) => ConversationsFolderRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsFolderRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE folder_id = ${db.escape(Number(r.folder_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(ConversationsListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => ConversationsAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsAddRequest = res.locals.request;
        
        let inserted = r.conversations.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item) {
                let payload = new ConversationsPayloads.added_conversation(
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
                
                stream.sendMessage(r.account_id, 'added_conversation', payload);
            });
        });
    });


router.route('/update/:device_id').post(
    (req, res, next) => ConversationsUpdateRequest.handler(req, res, next),
    function (req, res, next) {
        let r: ConversationsUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // TODO: This is inefficient but we have to have all the data :(
            let fields = ["device_id AS id", "color", "color_dark", "color_light", "color_accent", "led_color", "pinned", "read", "title", "snippet", "ringtone", "mute", "archive", "private_notifications"];

            let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} LIMIT 1`;

            db.query(sql, res, function (result) {
                if (result[0]) {
                    var payload = new ConversationsPayloads.updated_conversation(
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

                    stream.sendMessage(r.account_id, 'updated_conversation', payload);
                }
            });
        });
    });


router.route('/update_snippet/:device_id').post(
    (req, res, next) => ConversationsUpdateSnippetRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsUpdateSnippetRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.update_conversation_snippet(
                Number(r.device_id),
                r.read,
                Number(r.timestamp),
                r.snippet,
                r.archive
            );
            
            stream.sendMessage(r.account_id, 'update_conversation_snippet', payload);
        });
    });


router.route('/update_title/:device_id').post(
    (req, res, next) => ConversationsUpdateTitleRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsUpdateTitleRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.update_conversation_title(
                Number(r.device_id),
                String(r.title)
            );
            
            stream.sendMessage(r.account_id, 'update_conversation_title', payload);
        });
    });


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.removed_conversation(
                Number(r.device_id)
            );
            
            stream.sendMessage(r.account_id, 'removed_conversation', payload);
        });
    });


router.route('/read/:device_id').post(
    (req, res, next) => ConversationsReadRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsReadRequest = res.locals.request;
        
        let sql = `UPDATE ${table} SET ${db.escapeId("read")} = true WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.read_conversation(
                Number(r.device_id),
                String(r.android_device)
            );
            
            stream.sendMessage(r.account_id, 'read_conversation', payload);
        });
    });


router.route('/seen/:device_conversation_id').post(
    (req, res, next) => ConversationsSeenRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsSeenRequest = res.locals.request
        
        let sql = `UPDATE Messages SET seen = true WHERE device_conversation_id = ${db.escape(Number(r.device_conversation_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.seen_conversation(
                Number(r.device_conversation_id)
            );
            
            stream.sendMessage(r.account_id, 'seen_conversation', payload);
        });
    });


router.route('/seen').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `UPDATE Messages SET seen = true WHERE ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            let payload = new ConversationsPayloads.seen_conversations();

            // Send websocket message
            stream.sendMessage(r.account_id, 'seen_conversations', payload);
        });
    });


router.route('/archive/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `UPDATE ${table} SET archive = true, folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.archive_conversation(
                Number(r.device_id),
                true
            );
            
            stream.sendMessage(r.account_id, 'archive_conversation', payload);
        });
    });


router.route('/unarchive/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `UPDATE ${table} SET archive = false, folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.archive_conversation(
                Number(r.device_id),
                false
            );
            
            stream.sendMessage(r.account_id, 'archive_conversation', payload);
        });
    });


router.route('/add_to_folder/:device_id').post(
    (req, res, next) => ConversationsAddToFolderRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: ConversationsAddToFolderRequest = res.locals.request;

        let sql = `UPDATE ${table} SET folder_id = ${db.escape(Number(r.folder_id))} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.add_conversation_to_folder(
                Number(r.device_id),
                Number(r.folder_id)
            );
            
            stream.sendMessage(r.account_id, 'add_conversation_to_folder', payload);
        });
    });


router.route('/remove_from_folder/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `UPDATE ${table} SET folder_id = -1 WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse)

            // Send websocket message
            let payload = new ConversationsPayloads.remove_conversation_from_folder(
                Number(r.device_id)
            );
            
            stream.sendMessage(r.account_id, 'remove_conversation_from_folder', payload);
        });
    });


router.route('/cleanup_messages').post(
    (req, res, next) => ConversationsCleanupMessagesRequest.handler(req, res, next), 
    function (req, res, next) {
    let r: ConversationsCleanupMessagesRequest = res.locals.request;
    
    let sql = `DELETE FROM Messages WHERE device_conversation_id = ${db.escape(Number(r.conversation_id))} AND timestamp < ${db.escape(Number(r.timestamp))} AND ${r.whereAccount()}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        let payload = new ConversationsPayloads.cleanup_conversation_messages(
            Number(r.timestamp),
            String(r.conversation_id)
        );

        // Send websocket message
        stream.sendMessage(r.account_id, 'cleanup_conversation_messages', payload);
    });
});

export default router;
 
