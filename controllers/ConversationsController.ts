import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as ConversationsPayloads from '../models/payloads/ConversationsPayloads.js';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { ConversationsListResponse } from '../models/responses/ConversationsResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BaseRequest } from '../models/requests/BaseRequest.js';

const router = express.Router();

const table = 'Conversations'

const notInFolder = " (folder_id IS NULL OR folder_id < 0) ";

router.route('/').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)} ORDER BY timestamp DESC ${limitStr}`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/index_archived').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE archive = true AND ${notInFolder} AND ${db.whereAccount(accountId)} ORDER BY timestamp DESC`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/index_private').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE private_notifications = true AND ${notInFolder} AND ${db.whereAccount(accountId)} ORDER BY timestamp DESC`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/index_public_unarchived').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    
    let sql = `SELECT * FROM ${table} WHERE archive = false AND private_notifications = false AND ${db.whereAccount(accountId)} ORDER BY timestamp DESC ${limitStr}`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/index_public_unread').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    
    let sql = `SELECT * FROM ${table} WHERE ${db.escapeId("read")} = false AND private_notifications = false AND ${db.whereAccount(accountId)} ORDER BY timestamp DESC ${limitStr}`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/:deviceId').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)} LIMIT 1`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.fromResult(result));
    });
});


router.route('/folder/:folderId').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE folder_id = ${db.escape(Number(req.params.folderId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(ConversationsListResponse.getList(result));
    });
});


router.route('/add').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let inserted: any[] = [];
    
    req.body.conversations.forEach(function (item: any) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            folder_id: item.folder_id,
            color: item.color,
            color_dark: item.color_dark,
            color_light: item.color_light,
            color_accent: item.color_accent,
            led_color: item.led_color,
            pinned: item.pinned,
            read: item.read,
            timestamp: item.timestamp,
            title: item.title,
            phone_numbers: item.phone_numbers,
            snippet: item.snippet,
            ringtone: item.ringtone,
            image_uri: item.image_uri,
            id_matcher: item.id_matcher,
            mute: item.mute,
            archive: item.archive,
            private_notifications: item.private_notifications
        };
        
        inserted.push(toInsert);
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
            
            stream.sendMessage(accountId, 'added_conversation', payload);
        });
    });
});


router.route('/update/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let toUpdate = {
        color: req.body.color,
        color_dark: req.body.color_dark,
        color_light: req.body.color_light,
        color_accent: req.body.color_accent,
        led_color: req.body.led_color,
        pinned: req.body.pinned,
        read: req.body.read,
        timestamp: req.body.timestamp,
        title: req.body.title,
        snippet: req.body.snippet,
        ringtone: req.body.ringtone,
        mute: req.body.mute,
        archive: req.body.archive,
        private_notifications: req.body.private_notifications
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)

        // TODO: This is inefficient but we have to have all the data :(
        let fields = ["device_id AS id", "color", "color_dark", "color_light", "color_accent", "led_color", "pinned", "read", "title", "snippet", "ringtone", "mute", "archive", "private_notifications"];
        
        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)} LIMIT 1`;
        
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

                stream.sendMessage(accountId, 'updated_conversation', payload);
            }
        });
    });
});


router.route('/update_snippet/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let toUpdate = {
        read: req.body.read,
        timestamp: req.body.timestamp,
        snippet: req.body.snippet,
        archive: req.body.archive
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.update_conversation_snippet(
            Number(req.params.deviceId),
            req.body.read,
            Number(req.body.timestamp),
            req.body.snippet,
            req.body.archive
        );
        
        stream.sendMessage(accountId, 'update_conversation_snippet', payload);
    });
});


router.route('/update_title/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!req.query.title) {
        res.json(new MissingParamError);
        return;
    }
    
    let toUpdate = {
        title: req.query.title
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.update_conversation_title(
            Number(req.params.deviceId),
            String(req.query.title)
        );
        
        stream.sendMessage(accountId, 'update_conversation_title', payload);
    });
});


router.route('/remove/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.removed_conversation(
            Number(req.params.deviceId)
        );
        
        stream.sendMessage(accountId, 'removed_conversation', payload);
    });
});


router.route('/read/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE ${table} SET ${db.escapeId("read")} = true WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.read_conversation(
            Number(req.params.deviceId),
            String(req.query.android_device)
        );
        
        stream.sendMessage(accountId, 'read_conversation', payload);
    });
});


router.route('/seen/:deviceConversationId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE Messages SET seen = true WHERE device_conversation_id = ${db.escape(Number(req.params.deviceConversationId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.seen_conversation(
            Number(req.params.deviceConversationId)
        );
        
        stream.sendMessage(accountId, 'seen_conversation', payload);
    });
});


router.route('/seen').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE Messages SET seen = true WHERE ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)

        let payload = new ConversationsPayloads.seen_conversations();
        
        // Send websocket message
        stream.sendMessage(accountId, 'seen_conversations', payload);
    });
});


router.route('/archive/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE ${table} SET archive = true, folder_id = -1 WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.archive_conversation(
            Number(req.params.deviceId),
            true
        );
        
        stream.sendMessage(accountId, 'archive_conversation', payload);
    });
});


router.route('/unarchive/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE ${table} SET archive = false, folder_id = -1 WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.archive_conversation(
            Number(req.params.deviceId),
            false
        );
        
        stream.sendMessage(accountId, 'archive_conversation', payload);
    });
});


router.route('/add_to_folder/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!req.query.folder_id) {
        res.json(new MissingParamError);
        return;
    }
    
    let sql = `UPDATE ${table} SET folder_id = ${db.escape(Number(req.query.folder_id))} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.add_conversation_to_folder(
            Number(req.params.deviceId),
            Number(req.query.folder_id)
        );
        
        stream.sendMessage(accountId, 'add_conversation_to_folder', payload);
    });
});


router.route('/remove_from_folder/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `UPDATE ${table} SET folder_id = -1 WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        // Send websocket message
        let payload = new ConversationsPayloads.remove_conversation_from_folder(
            Number(req.params.deviceId)
        );
        
        stream.sendMessage(accountId, 'remove_conversation_from_folder', payload);
    });
});


router.route('/cleanup_messages').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!req.query.timestamp || !req.query.conversation_id) {
        res.json(new MissingParamError);
        return;
    }
    
    let sql = `DELETE FROM Messages WHERE device_conversation_id = ${db.escape(Number(req.query.conversation_id))} AND timestamp < ${db.escape(Number(req.query.timestamp))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json(new BaseResponse)
        
        let payload = new ConversationsPayloads.cleanup_conversation_messages(
            Number(req.query.timestamp),
            String(req.query.conversation_id)
        );

        // Send websocket message
        stream.sendMessage(accountId, 'cleanup_conversation_messages', payload);
    });
});

export default router;
 
