import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import { MediaAddRequest, MediaGetRequest } from '../models/requests/MediaRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { MediaGetResponse } from '../models/responses/MediaResponses.js';

const router = express.Router();

router.route('/add').post(
    (req, res, next) => MediaAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MediaAddRequest = res.locals.request;

        let sql = `INSERT INTO Media ${db.insertStr([r])}`;

        await db.query(sql);
            
        res.json(new BaseResponse);
    }));

router.route('/:message_id').get(
    (req, res, next) => MediaGetRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: MediaGetRequest = res.locals.request;
        
        let sql = `SELECT * FROM Media WHERE message_id = ${db.escape(Number(r.message_id))} AND ${r.whereAccount()} LIMIT 1`;

        let result = await db.query(sql);
            
        res.json(MediaGetResponse.fromResult(result));
    }));

export default router;
 
