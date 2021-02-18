import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as BlacklistsPayloads from '../models/payloads/BlacklistsPayloads.js';
import { BlacklistListResponse } from '../models/responses/BlacklistsResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { BlacklistsAddRequest } from '../models/requests/BlacklistsRequests.js';


const router = express.Router();

const table = "Blacklists"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(BlacklistListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => BlacklistsAddRequest.handler(req, res, next),
    function (req, res, next) {
        let r: BlacklistsAddRequest = res.locals.request;

        let inserted = r.blacklists.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item: any) {
                let payload = new BlacklistsPayloads.added_blacklist(
                    item.device_id,
                    item.phone_number,
                    item.phrase
                );
                
                stream.sendMessage(r.account_id, 'added_blacklist', payload);
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
            let payload = new BlacklistsPayloads.removed_blacklist(
                Number(r.device_id)
            );
            
            stream.sendMessage(r.account_id, 'removed_blacklist', payload);
        });
    });

export default router;
 
