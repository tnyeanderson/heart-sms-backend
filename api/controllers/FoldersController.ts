import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as FoldersPayloads from '../models/payloads/FoldersPayloads.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { FoldersAddRequest, FoldersUpdateRequest } from '../models/requests/FoldersRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { FoldersListResponse } from '../models/responses/FoldersResponses.js';

const router = express.Router();

const table = "Folders"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: AccountIdRequest = res.locals.request;
        
        let fields = ['session_id AS account_id', 'id', 'device_id', 'name', 'color', 'color_dark', 'color_light', 'color_accent'];

        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ${db.newestFirst(table)}`;

        let result = await db.query(sql);
            
        res.json(FoldersListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => FoldersAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: FoldersAddRequest = res.locals.request;
        
        let items = r.folders.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        let sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(function (item) {
            let payload = new FoldersPayloads.added_folder(
                item.device_id,
                item.name,
                item.color,
                item.color_dark,
                item.color_light,
                item.color_accent
            )
            
            payload.send(r.account_id);
        });
        
    }));


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: DeviceIdRequest = res.locals.request;
        
        // Delete the folder
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;
        
        await db.query(sql);

        res.json(new BaseResponse);

        let payload = new FoldersPayloads.removed_folder(
            Number(r.device_id)
        );
        
        // Send websocket message
        payload.send(r.account_id);
    }));


router.route('/update/:device_id').post(
    (req, res, next) => FoldersUpdateRequest.handler(req, res, next), 
    asyncHandler(async (req, res, next) => {
        let r: FoldersUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse);

        let payload = new FoldersPayloads.updated_folder(
            Number(r.device_id),
            r.name,
            r.color,
            r.color_dark,
            r.color_light,
            r.color_accent
        )

        payload.send(r.account_id);
    }));

export default router;
 
