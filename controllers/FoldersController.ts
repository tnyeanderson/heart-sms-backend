import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as FoldersPayloads from '../models/payloads/FoldersPayloads.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { FoldersListResponse } from '../models/responses/FoldersResponses.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { FoldersAddRequest, FoldersUpdateRequest } from '../models/requests/FoldersRequests.js';

const router = express.Router();

const table = "Folders"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: AccountIdRequest = res.locals.request;
        
        let sql = `SELECT * FROM ${table} WHERE ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(FoldersListResponse.getList(result));
        });
    });


router.route('/add').post(
    (req, res, next) => FoldersAddRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: FoldersAddRequest = res.locals.request;
        
        let inserted = r.folders.map((item) => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            // Send websocket message
            inserted.forEach(function (item) {
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
        });
    });


router.route('/remove/:device_id').post(
    (req, res, next) => DeviceIdRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: DeviceIdRequest = res.locals.request;
        
        // Delete the folder
        let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;
        

        db.query(sql, res, function (result) {
            res.json(new BaseResponse);

            let payload = new FoldersPayloads.removed_folder(
                Number(r.device_id)
            );
            
            // Send websocket message
            payload.send(r.account_id);
        });
    });


router.route('/update/:device_id').post(
    (req, res, next) => FoldersUpdateRequest.handler(req, res, next), 
    function (req, res, next) {
        let r: FoldersUpdateRequest = res.locals.request;

        let sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

        db.query(sql, res, function (result) {
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
        });
    });

export default router;
 
