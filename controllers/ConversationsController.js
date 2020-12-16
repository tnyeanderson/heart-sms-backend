var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

var table = 'Conversations'

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + req.query.limit;
        if (req.query.offset) {
            limitStr += ' OFFSET ' + req.query.offset;
        }
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_archived').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE archive = true AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_private').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE private_notifications = true AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/index_public_unarchived').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + req.query.limit;
        if (req.query.offset) {
            limitStr += ' OFFSET ' + req.query.offset;
        }
    }
    
    var sql = "SELECT * FROM " + table + " WHERE archive = false AND private_notifications = false AND " + db.whereAccount(req.query.account_id) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/:deviceId').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id) + " LIMIT 1";

    db.query(sql, res, function (result) {
        res.json(result[0] || null);
    });
});


router.route('/folder/:folderId').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE folder_id = " + mysql.escape(Number(req.params.folderId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'folder_id', 'color', 'color_dark', 'color_light', 'color_accent', 'led_color', 'pinned', '`read`', '`timestamp`', 'title', 'phone_numbers', 'snippet', 'ringtone', 'image_uri', 'id_matcher', 'mute', 'archive', 'private_notifications'];
    var sqls = [];
    
    req.body.conversations.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.folder_id),
            mysql.escape(item.color),
            mysql.escape(item.color_dark),
            mysql.escape(item.color_light),
            mysql.escape(item.color_accent),
            mysql.escape(item.led_color),
            mysql.escape(item.pinned),
            mysql.escape(item.read),
            mysql.escape(item.timestamp),
            mysql.escape(item.title),
            mysql.escape(item.phone_numbers),
            mysql.escape(item.snippet),
            mysql.escape(item.ringtone),
            mysql.escape(item.image_uri),
            mysql.escape(item.id_matcher),
            mysql.escape(item.mute),
            mysql.escape(item.archive),
            mysql.escape(item.private_notifications)
        ];
        
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        color: mysql.escape(req.body.color),
        color_dark: mysql.escape(req.body.color_dark),
        color_light: mysql.escape(req.body.color_light),
        color_accent: mysql.escape(req.body.color_accent),
        led_color: mysql.escape(req.body.led_color),
        pinned: mysql.escape(req.body.pinned),
        read: mysql.escape(req.body.read),
        timestamp: mysql.escape(req.body.timestamp),
        title: mysql.escape(req.body.title),
        snippet: mysql.escape(req.body.snippet),
        ringtone: mysql.escape(req.body.ringtone),
        mute: mysql.escape(req.body.mute),
        archive: mysql.escape(req.body.archive),
        private_notifications: mysql.escape(req.body.private_notifications)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_snippet/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        read: mysql.escape(req.body.read),
        timestamp: mysql.escape(req.body.timestamp),
        snippet: mysql.escape(req.body.snippet),
        archive: mysql.escape(req.body.archive)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_title/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.title) {
        res.json(errors.missingParam);
        return;
    }
    
    var toUpdate = {
        title: mysql.escape(req.query.title)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_snippet/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.title) {
        res.json(errors.missingParam);
        return;
    }
    
    var toUpdate = {
        title: mysql.escape(req.query.title)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/read/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    // TODO: Handle android_device query param
    
    var sql = "UPDATE " + table + " SET `read` = true WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/seen/:deviceConversationId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE Messages SET seen = true WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/seen').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE Messages SET seen = true WHERE " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/archive/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET archive = true WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/unarchive/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET archive = false WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/add_to_folder/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.folder_id) {
        res.json(errors.missingParam);
        return;
    }
    
    var sql = "UPDATE " + table + " SET folder_id = " + mysql.escape(Number(req.query.folder_id)) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove_from_folder/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET folder_id = -1 WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/cleanup_messages').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.timestamp || !req.query.conversation_id) {
        res.json(errors.missingParam);
        return;
    }
    
    var sql = "DELETE FROM Messages WHERE device_conversation_id = " + mysql.escape(req.query.conversation_id) + " AND timestamp < " + mysql.escape(req.query.timestamp) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
