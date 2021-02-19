import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as TemplatesPayloads from '../models/payloads/TemplatesPayloads.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { TemplatesListResponse } from '../models/responses/TemplatesResponses.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { TemplatesAddRequest, TemplatesUpdateRequest } from '../models/requests/TemplatesRequests.js';

const router = express.Router();

const table = "Templates"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(TemplatesListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => TemplatesAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: TemplatesAddRequest = res.locals.request;
        
        let inserted = r.templates.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item) {
                let payload = new TemplatesPayloads.added_template(
                    item.device_id,
                    item.text
                )
                
                payload.send(r.account_id);
            });
        });
    });


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            let payload = new TemplatesPayloads.removed_template(
                Number(r.device_id)
            );
            
            payload.send(r.account_id);
        });
    });


router.route('/update/:device_id').post(
    (req, res, next) => TemplatesUpdateRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: TemplatesUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            let payload = new TemplatesPayloads.updated_template(
                Number(r.device_id),
                String(r.text)
            );
            
            payload.send(r.account_id);
        });
    });

export default router;
 
