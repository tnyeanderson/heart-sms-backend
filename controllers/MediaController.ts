import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import util from '../utils/util.js';

const router = express.Router();

router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.body.message_id || !req.body.data) {
        res.json(errors.missingParam);
        return
    }
    
    let toInsert = {
        account_id: accountId,
        message_id: Number(req.body.message_id),
        data: req.body.data
    }
    
    let sql = `INSERT INTO Media ${db.insertStr([toInsert])}`;
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});

router.route('/:messageId').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `SELECT * FROM Media WHERE message_id = ${db.escape(Number(req.params.messageId))} AND ${db.whereAccount(accountId)} LIMIT 1`;
    

    db.query(sql, res, function (result) {
        res.json({
            data: result[0].data.toString()
        });
    });
});

export default router;
 
