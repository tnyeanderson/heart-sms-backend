import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as DevicesPayloads from '../models/payloads/DevicesPayloads.js';
import { AccountIdRequest } from '../models/requests/BaseRequests.js';
import { DevicesAddRequest, DevicesRemoveRequest, DevicesUpdatePrimaryRequest, DevicesUpdateRequest } from '../models/requests/DevicesRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { DevicesAddResponse, DevicesListResponse } from '../models/responses/DevicesResponses.js';

const router = express.Router();

const table = "Devices"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;
        
        const fields = ['session_id AS account_id', 'device_id AS id', 'info', 'name', 'primary', 'fcm_token', 'ios'];

        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()}`;
        
        const result = await db.query(sql);
            
        res.json(DevicesListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => DevicesAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DevicesAddRequest = res.locals.request;

        const toInsert = {
            account_id: r.account_id,
            device_id: r.device.id,
            info: r.device.info,
            name: r.device.name,
            primary: r.device.primary,
            fcm_token: r.device.fcm_token
        };

        const sql = `INSERT INTO ${table} ${db.insertStr(toInsert)}`;

        await db.query(sql);
            
        res.json(DevicesAddResponse.fromResult([r.device]));
    }));


router.route('/remove/:id').post(
    (req, res, next) => DevicesRemoveRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DevicesRemoveRequest = res.locals.request;

        // Remove the device
        const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.id))} AND ${r.whereAccount()}`;
        
        await db.query(sql);
            
        res.json(new BaseResponse);
    }));


router.route('/update/:id').post(
    (req, res, next) => DevicesUpdateRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DevicesUpdateRequest = res.locals.request;

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.id))} AND ${r.whereAccount()}`;

        await db.query(sql);
        
        res.json(new BaseResponse);
    }));


router.route('/update_primary').post(
    (req, res, next) => DevicesUpdatePrimaryRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: DevicesUpdatePrimaryRequest = res.locals.request;
        
        // Calls the MYSQL stored procedure
        const sql = `CALL UpdatePrimaryDevice( ${db.escape(r.account_id)} , ${db.escape(Number(r.new_primary_device_id))} )`;
        
        await db.query(sql);
            
        res.json(new BaseResponse);

        const payload = new DevicesPayloads.update_primary_device(
            String(r.new_primary_device_id)
        );
        
        // Send websocket message
        payload.send(r.account_id);
    }));

export default router;
 
