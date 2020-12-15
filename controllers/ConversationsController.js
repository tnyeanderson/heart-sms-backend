var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

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
    
    var cols = ['id', 'account_id', 'device_id', 'folder_id', 'color', 'color_dark',
'color_light', 'color_accent', 'led_color', 'pinned', 'read', 'timestamp', 'title', 'phone_numbers', 'snippet', 'ringtone', 'image_uri', 'id_matcher', 'mute', 'archive', 'private_notifications'];
    
    var sql = "SELECT " + cols.join(', ') + " FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'folder_id', 'color', 'color_dark', 'color_light', 'color_accent', 'led_color', 'pinned', 'read', 'timestamp', 'title', 'phone_numbers', 'snippet', 'ringtone', 'image_uri', 'id_matcher', 'mute', 'archive', 'private_notifications'];
    var sqls = [];
    
    req.body.messages.forEach(function (item) {
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
    
    var cols = ['color', 'color_dark', 'color_light', 'color_accent', 'led_color', 'pinned', 'read', 'timestamp', 'title', 'snippet', 'ringtone', 'mute', 'archive', 'private_notifications'];
    var values = [
        mysql.escape(req.body.color),
        mysql.escape(req.body.color_dark),
        mysql.escape(req.body.color_light),
        mysql.escape(req.body.color_accent),
        mysql.escape(req.body.led_color),
        mysql.escape(req.body.pinned),
        mysql.escape(req.body.read),
        mysql.escape(req.body.timestamp),
        mysql.escape(req.body.title),
        mysql.escape(req.body.snippet),
        mysql.escape(req.body.ringtone),
        mysql.escape(req.body.mute),
        mysql.escape(req.body.archive),
        mysql.escape(req.body.private_notifications)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_snippet/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['read', 'timestamp', 'snippet', 'archive'];
    var values = [
        mysql.escape(req.body.read),
        mysql.escape(req.body.timestamp),
        mysql.escape(req.body.snippet),
        mysql.escape(req.body.archive)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

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
    
    var cols = ['title'];
    var values = [
        mysql.escape(req.query.title)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

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
    
    var sql = "UPDATE " + table + " SET read = true WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/seen/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET seen = true WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/seen').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET seen = true WHERE " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/archive/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET archive = true WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/unarchive/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET archive = false WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

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
    
    var sql = "UPDATE " + table + " SET folder_id = " + mysql.escape(req.query.folder_id) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove_from_folder/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "UPDATE " + table + " SET folder_id = NULL WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

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
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.query.conversation_id) + " AND timestamp < " + mysql.escape(req.query.timestamp) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});

module.exports = router;
 
