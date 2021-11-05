import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as ContactsPayloads from '../models/payloads/ContactsPayloads.js';
import { AccountIdRequest, LimitOffsetRequest } from '../models/requests/BaseRequests.js';
import { ContactsAddRequest, ContactsRemoveDeviceIdRequest, ContactsRemoveIdsRequest, ContactsUpdateDeviceIdRequest } from '../models/requests/ContactsRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { ContactsListResponse, ContactsSimpleListResponse } from '../models/responses/ContactsResponses.js';

const router = express.Router();

const table = 'Contacts';

router.route('/').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const cols = ['session_id AS account_id', 'id', 'device_id', 'phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent', 'contact_type'];
        
        const sql = `SELECT ${db.selectFields(cols)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ${db.newestFirst(table)} ${r.limitStr()}`;

        const result = await db.query(sql);
        
        res.json(ContactsListResponse.getList(result));
    }));

router.route('/simple').get(
    (req, res, next) => LimitOffsetRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: LimitOffsetRequest = res.locals.request;
        
        const cols = ['phone_number', 'name', 'id', 'id_matcher', 'color', 'color_accent', 'contact_type'];
        
        const sql = `SELECT ${db.selectFields(cols)} FROM ${table} WHERE ${r.whereAccount()} ${db.newestFirst(table)} ${r.limitStr()}`;

        const result = await db.query(sql);
        
        res.json(ContactsSimpleListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => ContactsAddRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ContactsAddRequest = res.locals.request;
        
        const items = r.contacts.map(item => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        const sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(item => {
            const payload = new ContactsPayloads.added_contact(
                item.phone_number,
                item.name,
                item.color,
                item.color_dark,
                item.color_light,
                item.color_accent,
                item.contact_type
            );
            
            payload.send(r.account_id);
        });
    }));


router.route('/clear').post(
    (req, res, next) => AccountIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;
        
        const sql = `DELETE FROM ${table} WHERE ${r.whereAccount()}`;

        await db.query(sql);
            
        res.json(new BaseResponse);
    }));


router.route('/update_device_id').post(
    (req, res, next) => ContactsUpdateDeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ContactsUpdateDeviceIdRequest = res.locals.request;

        const payloadFields = ["device_id", "phone_number", "name", "color", "color_dark", "color_light", "color_accent", "contact_type AS type"];

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} RETURNING ${db.selectFields(payloadFields)}`;

        const result = await db.query(sql);
        res.json(new BaseResponse);

        if (result[0]) {
            const payload = new ContactsPayloads.updated_contact(
                result[0].device_id,
                result[0].phone_number,
                result[0].name,
                result[0].color,
                result[0].color_dark,
                result[0].color_light,
                result[0].color_accent,
                result[0].type
            );

            payload.send(r.account_id);
        }
    }));


router.route('/remove_device_id').post(
    (req, res, next) => ContactsRemoveDeviceIdRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ContactsRemoveDeviceIdRequest = res.locals.request;
    
        const sql = `DELETE FROM ${table} WHERE ${r.whereAccount()} AND device_id = ${db.escape(Number(r.device_id))}`;

        await db.query(sql);
        res.json(new BaseResponse);

        const payload = new ContactsPayloads.removed_contact(
            Number(r.device_id),
            String(r.phone_number)
        );
        
        payload.send(r.account_id);
    }));


router.route('/remove_ids/:ids').post(
    (req, res, next) => ContactsRemoveIdsRequest.handler(req, res, next), 
    asyncHandler(async (req, res) => {
        const r: ContactsRemoveIdsRequest = res.locals.request;
    
        const whereId: string[] = [];
        
        r.ids.split(',').forEach((id: string) => {
            whereId.push(db.escape(Number(id)));
        });
        
        const sql = `DELETE FROM ${table} WHERE ${r.whereAccount()} AND ${db.escapeId('id')} in ( ${whereId.join(', ')} )`;
    
        await db.query(sql);
        res.json(new BaseResponse);
    
        const payload = new ContactsPayloads.removed_contact_by_id(
            r.ids
        );
        
        // Send websocket message
        payload.send(r.account_id);
    }));


export default router;
 
