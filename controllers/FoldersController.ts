import express from 'express';
import db from '../db/query';
import errors from '../utils/errors';
import stream from './StreamController';
import util from '../utils/util';
import * as FoldersPayloads from '../models/payloads/FoldersPayloads';

const router = express.Router();

const table = "Folders"

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
    
    req.body.folders.forEach(function (item: any) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            name: item.name,
            color: item.color,
            color_dark: item.color_dark,
            color_light: item.color_light,
            color_accent: item.color_accent
        };
        
        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let payload = new FoldersPayloads.added_folder(
                item.device_id,
                item.name,
                item.color,
                item.color_dark,
                item.color_light,
                item.color_accent
            )
            
            stream.sendMessage(accountId, 'added_folder', payload);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    // Delete the folder
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});

        let payload = new FoldersPayloads.removed_folder(
            Number(req.params.deviceId)
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_folder', payload);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        name: req.body.name,
        color: req.body.color,
        color_dark: req.body.color_dark,
        color_light: req.body.color_light,
        color_accent: req.body.color_accent
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});

        let payload = new FoldersPayloads.updated_folder(
            Number(req.params.deviceId),
            toUpdate.name,
            toUpdate.color,
            toUpdate.color_dark,
            toUpdate.color_light,
            toUpdate.color_accent
        )
            
        stream.sendMessage(accountId, 'updated_folder', payload);
    });
});

module.exports = router;
 
