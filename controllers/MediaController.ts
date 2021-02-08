import express from 'express';
import db from '../db/query.js';
import util from '../utils/util.js';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { MediaGetResponse } from '../models/responses/MediaResponses.js';
import { BaseRequest } from '../models/requests/BaseRequest.js';

const router = express.Router();

router.route('/add').post(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!req.body.message_id || !req.body.data) {
        res.json(new MissingParamError);
        return
    }
    
    let toInsert = {
        account_id: accountId,
        message_id: Number(req.body.message_id),
        data: req.body.data
    }
    
    let sql = `INSERT INTO Media ${db.insertStr([toInsert])}`;
    

    db.query(sql, res, function (result) {
        res.json(new BaseResponse);
    });
});

router.route('/:messageId').get(BaseRequest.validate, function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM Media WHERE message_id = ${db.escape(Number(req.params.messageId))} AND ${db.whereAccount(accountId)} LIMIT 1`;
    

    db.query(sql, res, function (result) {
        res.json(new MediaGetResponse(result[0].data.toString()));
    });
});

export default router;
 
