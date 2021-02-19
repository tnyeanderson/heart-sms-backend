import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as DevicesPayloads from '../models/payloads/DevicesPayloads.js';
import { MissingParamError } from '../models/responses/ErrorResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { DevicesListResponse } from '../models/responses/DevicesResponses.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { DevicesAddRequest, DevicesRemoveRequest, DevicesUpdatePrimaryRequest, DevicesUpdateRequest } from '../models/requests/DevicesRequests.js';

const router = express.Router();

const table = "Devices"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(DevicesListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => DevicesAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DevicesAddRequest = res.locals.request;

        let toInsert = {
            account_id: r.account_id,
            id: r.device.id,
            info: r.device.info,
            name: r.device.name,
            primary: r.device.primary,
            fcm_token: r.device.fcm_token
        };

        let sql = `INSERT INTO ${table} ${db.insertStr([toInsert])}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);
        });
    });


router.route('/remove/:id').post(
    (req, res, next) => DevicesRemoveRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DevicesRemoveRequest = res.locals.request;

        // Remove the device
        let sql = `DELETE FROM ${table} WHERE id = ${db.escape(Number(r.id))} AND ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);
        });
    });


router.route('/update/:id').post(
    (req, res, next) => DevicesUpdateRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DevicesUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE id = ${db.escape(Number(r.id))} AND ${r.whereAccount()}`;


        db.query(sql, res, function (result) {
            res.json(new BaseResponse);
        });
    });


router.route('/update_primary').post(
    (req, res, next) => DevicesUpdatePrimaryRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DevicesUpdatePrimaryRequest = res.locals.request;
        
        // Calls the MYSQL stored procedure
        let sql = `CALL UpdatePrimaryDevice( ${db.escape(r.account_id)} , ${db.escape(Number(r.new_primary_device_id))} )`;
        
        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            let payload = new DevicesPayloads.update_primary_device(
                String(r.new_primary_device_id)
            );
            
            // Send websocket message
            payload.send(r.account_id);
        });
    });

export default router;
 
