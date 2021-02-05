import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as ContactsPayloads from '../models/payloads/ContactsPayloads.js';

const router = express.Router();

const table = 'Contacts';

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    
    let cols = ['id', 'account_id', 'device_id', 'phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type'];
    
    let sql = `SELECT ${db.selectFields(cols)} FROM ${table} WHERE ${db.whereAccount(accountId)} ${limitStr}`;

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
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    
    let cols = ['phone_number', 'name', 'id', 'id_matcher', 'color', 'color_accent', 'contact_type'];
    
    let sql = `SELECT ${db.selectFields(cols)} FROM ${table} WHERE ${db.whereAccount(accountId)} ${limitStr}`;

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
    
    let inserted: any[] = [];
    
    req.body.contacts.forEach(function (item: any) {
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

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item: any) {
            let payload = new ContactsPayloads.added_contact(
                item.phone_number,
                item.name,
                item.color,
                item.color_dark,
                item.color_light,
                item.color_accent,
                item.contact_type
            );
            
            stream.sendMessage(accountId, 'added_contact', payload);
        });
    });
});


router.route('/clear').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `DELETE FROM ${table} WHERE ${db.whereAccount(accountId)}`;

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
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.query.device_id))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});
        
        
        // TODO: this is inefficient, but we need the contact_type
        let fields = ["device_id", "phone_number", "name", "color", "color_dark", "color_light", "color_accent", "contact_type AS type"];
        
        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(req.query.device_id))} AND ${db.whereAccount(accountId)} LIMIT 1`;
        
        db.query(sql, res, function (result) {
            if (result[0]) {
                let payload = new ContactsPayloads.updated_contact(
                    result[0].device_id,
                    result[0].phone_number,
                    result[0].name,
                    result[0].color,
                    result[0].color_dark,
                    result[0].color_light,
                    result[0].color_accent,
                    result[0].type
                );

                stream.sendMessage(accountId, 'updated_contact', payload);
            }
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
    
    let sql = `DELETE FROM ${table} WHERE ${db.whereAccount(accountId)} AND device_id = ${db.escape(Number(req.query.device_id))}`;
    

    db.query(sql, res, function (result) {
        res.json({});
        
        let payload = new ContactsPayloads.removed_contact(
            Number(req.query.device_id),
            String(req.query.phone_number)
        );
        
        stream.sendMessage(accountId, 'removed_contact', payload);
    });
});


router.route('/remove_ids/:ids').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let whereId: string[] = [];
    
    req.params.ids.split(',').forEach((id: string) => {
        whereId.push(db.escape(Number(id)));
    });
    
    let sql = `DELETE FROM ${table} WHERE ${db.whereAccount(accountId)} AND ${db.escapeId('id')} in ( ${whereId.join(', ')} )`;

    db.query(sql, res, function (result) {
        res.json({});

        let payload = new ContactsPayloads.removed_contact_by_id(
            req.params.ids
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_contact_by_id', payload);
    });
});


export default router;
 
