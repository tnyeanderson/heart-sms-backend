import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as BlacklistsPayloads from '../models/payloads/BlacklistsPayloads.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { BlacklistsAddRequest } from '../models/requests/BlacklistsRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BlacklistListResponse } from '../models/responses/BlacklistsResponses.js';


const router = express.Router();

const table = "Blacklists"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        const r: AccountIdRequest = res.locals.request;

        const fields = ['session_id AS account_id', 'id', 'device_id', 'phone_number', 'phrase'];
        
        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ${db.newestFirst(table)}`;

        const result = await db.query(sql);
            
        res.json(BlacklistListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => BlacklistsAddRequest.handler(req, res, next),
    asyncHandler(async (req, res, next) => {
        const r: BlacklistsAddRequest = res.locals.request;

        const items = r.blacklists.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        const sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(function (item: any) {
            const payload = new BlacklistsPayloads.added_blacklist(
                item.device_id,
                item.phone_number,
                item.phrase
            );
            
            payload.send(r.account_id);
        });
    }));


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next),
    asyncHandler(async (req, res, next) => {
        const r: DeviceIdRequest = res.locals.request;
        
        const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);
            
        res.json(new BaseResponse);

        // Send websocket message
        const payload = new BlacklistsPayloads.removed_blacklist(
            Number(r.device_id)
        );
        
        payload.send(r.account_id);
    }));

export default router;
 
