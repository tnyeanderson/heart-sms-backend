import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as TemplatesPayloads from '../models/payloads/TemplatesPayloads.js';

const router = express.Router();

const table = "Templates"

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)}`;
    

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
    
    req.body.templates.forEach(function (item: any) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            text: item.text
        };
        
        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let payload = new TemplatesPayloads.added_template(
                item.device_id,
                item.text
            )
            
            stream.sendMessage(accountId, 'added_template', payload);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let payload = new TemplatesPayloads.removed_template(
            Number(req.params.deviceId)
        );
        
        stream.sendMessage(accountId, 'removed_template', payload);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        text: req.body.text
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let toKeep = ['device_id', 'text'];
            
        let payload = new TemplatesPayloads.updated_template(
            Number(req.params.deviceId),
            String(req.body.text)
        );
        
        stream.sendMessage(accountId, 'updated_template', payload);
    });
});

export default router;
 
