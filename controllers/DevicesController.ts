import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as DevicesPayloads from '../models/payloads/DevicesPayloads.js';

const router = express.Router();

const table = "Devices"

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

    let toInsert = {
        account_id: accountId,
        id: req.body.device.id,
        info: req.body.device.info,
        name: req.body.device.name,
        primary: req.body.device.primary,
        fcm_token: req.body.device.fcm_token
    };
    
    let sql = `INSERT INTO ${table} ${db.insertStr([toInsert])}`;
        
    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/remove/:id').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }

    // Remove the device
    let sql = `DELETE FROM ${table} WHERE id = ${db.escape(Number(req.params.id))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update/:id').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        fcm_token: req.query.fcm_token,
        name: req.query.name
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE id = ${db.escape(Number(req.params.id))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/update_primary').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.new_primary_device_id) {
        res.json(errors.missingParam);
        return;
    }
    
    // Calls the MYSQL stored procedure
    let sql = `CALL UpdatePrimaryDevice( ${db.escape(accountId)} , ${db.escape(Number(req.query.new_primary_device_id))} )`;
    
    db.query(sql, res, function (result) {
        res.json({});

        let payload = new DevicesPayloads.update_primary_device(
            String(req.query.new_primary_device_id)
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'update_primary_device', payload);
    });
});

export default router;
 
