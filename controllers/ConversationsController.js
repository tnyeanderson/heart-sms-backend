const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = 'Conversations'

const notInFolder = " (folder_id IS NULL OR folder_id < 0) ";

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + mysql.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(Number(req.query.offset));
        }
    }
    
    let sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(accountId) + " ORDER BY timestamp DESC " + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_archived').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE archive = true AND " + notInFolder + " AND " + db.whereAccount(accountId) + " ORDER BY timestamp DESC ";

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_private').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE private_notifications = true AND " + notInFolder + " AND " + db.whereAccount(accountId) + " ORDER BY timestamp DESC ";

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_public_unarchived').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + mysql.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(Number(req.query.offset));
        }
    }
    
    let sql = "SELECT * FROM " + table + " WHERE archive = false AND private_notifications = false AND " + db.whereAccount(accountId) + " ORDER BY timestamp DESC " + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_public_unread').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + mysql.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + mysql.escape(Number(req.query.offset));
        }
    }
    
    let sql = "SELECT * FROM " + table + " WHERE `read` = false AND private_notifications = false AND " + db.whereAccount(accountId) + " ORDER BY timestamp DESC " + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/:deviceId').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";

    db.query(sql, res, function (result) {
        res.json(result[0] || null);
    });
});


router.route('/folder/:folderId').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE folder_id = " + mysql.escape(Number(req.params.folderId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let inserted = [];
    
    req.body.conversations.forEach(function (item) {
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

    let sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            delete item.image_uri;
            delete item.account_id;
            
            stream.sendMessage(accountId, 'added_conversation', item);
        });
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
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
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient but we have to have all the data :(
        let fields = ["device_id AS id", "color", "color_dark", "color_light", "color_accent", "led_color", "pinned", "read", "title", "snippet", "ringtone", "mute", "archive", "private_notifications"];
        
        let sql = "SELECT " + db.selectFields(fields) + " FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";
        
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'updated_conversation', result[0]);
        });
    });
});


router.route('/update_snippet/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        read: req.body.read,
        timestamp: req.body.timestamp,
        snippet: req.body.snippet,
        archive: req.body.archive
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            read: req.body.read,
            timestamp: req.body.timestamp,
            snippet: req.body.snippet,
            archive: req.body.archive
        };
        
        stream.sendMessage(accountId, 'update_conversation_snippet', msg);
    });
});


router.route('/update_title/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.title) {
        res.json(errors.missingParam);
        return;
    }
    
    let toUpdate = {
        title: req.query.title
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            title: req.query.title
        };
        
        stream.sendMessage(accountId, 'update_conversation_title', msg);
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'removed_conversation', msg);
    });
});


router.route('/read/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE " + table + " SET `read` = true WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            android_device: req.query.android_device
        };
        
        stream.sendMessage(accountId, 'read_conversation', msg);
    });
});


router.route('/seen/:deviceConversationId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE Messages SET seen = true WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceConversationId)
        };
        
        stream.sendMessage(accountId, 'seen_conversation', msg);
    });
});


router.route('/seen').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE Messages SET seen = true WHERE " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'seen_conversations', {});
    });
});


router.route('/archive/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE " + table + " SET archive = true, folder_id = -1 WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            archive: true
        };
        
        stream.sendMessage(accountId, 'archive_conversation', msg);
    });
});


router.route('/unarchive/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE " + table + " SET archive = false, folder_id = -1 WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            archive: false
        };
        
        stream.sendMessage(accountId, 'archive_conversation', msg);
    });
});


router.route('/add_to_folder/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.folder_id) {
        res.json(errors.missingParam);
        return;
    }
    
    let sql = "UPDATE " + table + " SET folder_id = " + mysql.escape(Number(req.query.folder_id)) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            folder_id: Number(req.query.folder_id)
        };
        
        stream.sendMessage(accountId, 'add_conversation_to_folder', msg);
    });
});


router.route('/remove_from_folder/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "UPDATE " + table + " SET folder_id = -1 WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'remove_conversation_from_folder', msg);
    });
});


router.route('/cleanup_messages').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.timestamp || !req.query.conversation_id) {
        res.json(errors.missingParam);
        return;
    }
    
    let sql = "DELETE FROM Messages WHERE device_conversation_id = " + mysql.escape(req.query.conversation_id) + " AND timestamp < " + mysql.escape(req.query.timestamp) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'cleanup_conversation_messages', {
            timestamp: req.query.timestamp,
            conversation_id: req.query.conversation_id
        });
    });
});

module.exports = router;
 
