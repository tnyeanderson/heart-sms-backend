const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = 'Contacts';

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + db.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + db.escape(Number(req.query.offset));
        }
    }
    
    let cols = ['id', 'account_id', 'device_id', 'phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type'];
    
    let sql = "SELECT " + cols.join(', ') + " FROM " + table + " WHERE " + db.whereAccount(accountId) + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});

router.route('/simple').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = '';
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + db.escape(Number(req.query.limit));
        if (req.query.offset) {
            limitStr += ' OFFSET ' + db.escape(Number(req.query.offset));
        }
    }
    
    let cols = ['phone_number', 'name', 'id', 'id_matcher', 'color', 'color_accent', 'contact_type'];
    
    let sql = "SELECT " + cols.join(', ') + " FROM " + table + " WHERE " + db.whereAccount(accountId) + limitStr;

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
    
    req.body.contacts.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            phone_number: item.phone_number,
            id_matcher: item.id_matcher,
            name: item.name,
            color: item.color,
            color_dark: item.color_dark,
            color_light: item.color_light,
            color_accent: item.color_accent,
            contact_type: item.contact_type
        };
        
        inserted.push(toInsert);
    });

    let sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let origKeys = ['contact_type'];
            let replaceWith = ['type'];
            
            let msg = util.renameKeys(item, origKeys, replaceWith);
            
            delete msg.device_id;
            delete msg.id_matcher;
            delete msg.account_id;
            
            stream.sendMessage(accountId, 'added_contact', msg);
        });
    });
});


router.route('/clear').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_device_id').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.device_id) {
        res.json(errors.missingParam);
        return;
    }
    
    let toUpdate = {
        phone_number: req.body.phone_number,
        name: req.body.name,
        color: req.body.color,
        color_dark: req.body.color_dark,
        color_light: req.body.color_light,
        color_accent: req.body.color_accent
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + db.escape(Number(req.query.device_id)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        
        // TODO: this is inefficient, but we need the contact_type
        let fields = ["device_id", "phone_number", "name", "color", "color_dark", "color_light", "color_accent", "contact_type AS type"];
        
        let sql = "SELECT " + db.selectFields(fields) + " FROM " + table + " WHERE device_id = " + db.escape(Number(req.query.device_id)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";
        
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'updated_contact', result[0]);
        });
    });
});


router.route('/remove_device_id').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.device_id || !req.query.phone_number) {
        res.json(errors.missingParam);
        return;        
    }
    
    let sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(accountId) + " AND device_id = " + db.escape(req.query.device_id);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = util.keepOnlyKeys(req.query, ['device_id', 'phone_number']);
        
        stream.sendMessage(accountId, 'removed_contact', msg);
    });
});


router.route('/remove_ids/:ids').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let whereId = [];
    let idList = req.params.ids.split(',');
    
    idList.forEach(id => {
        whereId.push('id = ' + db.escape(Number(id)));
    });
    
    let sql = "DELETE FROM " + table + " WHERE " + db.whereAccount(accountId) + " AND (" + whereId.join(' OR ') + ")";

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_contact_by_id', {
            id: req.params.ids
        });
    });
});


module.exports = router;
 
