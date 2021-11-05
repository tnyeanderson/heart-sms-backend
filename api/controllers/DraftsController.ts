import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as DraftsPayloads from '../models/payloads/DraftsPayloads.js';
import { AccountIdRequest } from '../models/requests/BaseRequests.js';
import { DraftsAddRequest, DraftsGetDraftRequest, DraftsRemoveRequest, DraftsReplaceRequest, DraftsUpdateRequest } from '../models/requests/DraftsRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { DraftsListResponse } from '../models/responses/DraftsResponses.js';

const router = express.Router();

const table = "Drafts"

router.route('/').get(
    (req, res, next) => AccountIdRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: AccountIdRequest = res.locals.request;

        const fields = ['session_id AS account_id', 'id', 'device_id', 'device_conversation_id', 'mime_type', 'data'];

        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE ${r.whereAccount()} ${db.newestFirst(table)}`;

        const result = await db.query(sql);

        res.json(DraftsListResponse.getList(result));
    }));


router.route('/:device_conversation_id').get(
    (req, res, next) => DraftsGetDraftRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: DraftsGetDraftRequest = res.locals.request;

        const fields = ['session_id AS account_id', 'id', 'device_id', 'device_conversation_id', 'mime_type', 'data'];

        const sql = `SELECT ${db.selectFields(fields)} FROM ${table} INNER JOIN SessionMap USING (account_id) WHERE device_conversation_id = ${db.escape(Number(r.device_conversation_id))} AND ${r.whereAccount()}`;


        const result = await db.query(sql);

        res.json(DraftsListResponse.getList(result));
    }));


router.route('/add').post(
    (req, res, next) => DraftsAddRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: DraftsAddRequest = res.locals.request;

        const items = r.drafts.map(item => {
            return Object.assign({ account_id: r.account_id }, item,);
        });

        // Generate a query for each item
        const sql = db.insertQueries(table, items);

        await db.transaction(sql);

        res.json(new BaseResponse);

        // Send websocket message
        items.forEach(item => {
            const payload = new DraftsPayloads.added_draft(
                item.device_id,
                item.device_conversation_id,
                item.data,
                item.mime_type
            )

            payload.send(r.account_id);
        });
    }));


router.route('/remove/:device_conversation_id').post(
    (req, res, next) => DraftsRemoveRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: DraftsRemoveRequest = res.locals.request;

        const sql = `DELETE FROM ${table} WHERE device_conversation_id = ${db.escape(Number(r.device_conversation_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse);

        // Send websocket message
        const payload = new DraftsPayloads.removed_drafts(
            Number(r.device_conversation_id),
            String(r.android_device)
        );

        payload.send(r.account_id);
    }));


router.route('/update/:device_id').post(
    (req, res, next) => DraftsUpdateRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: DraftsUpdateRequest = res.locals.request;

        console.log("*************** /drafts/update called!!!!!! **********************");

        const payloadFields = ["device_id AS id", "device_conversation_id AS conversation_id", "data", "mime_type"];

        const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()} RETURNING ${db.selectFields(payloadFields)}`;

        const result = await db.query(sql);
        res.json(new BaseResponse);

        const payload = new DraftsPayloads.replaced_drafts(
            result[0].id,
            result[0].conversation_id,
            result[0].data,
            result[0].mime_type
        );

        payload.send(r.account_id);
    }));


router.route('/replace/:device_conversation_id').post(
    (req, res, next) => DraftsReplaceRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: DraftsReplaceRequest = res.locals.request;

        // Only the first item is ever processed
        // URL param is ignored, device_conversation_id in the items aray in the body is used
        const sql = `UPDATE ${table} SET ${db.updateStr(r.drafts[0])} WHERE device_conversation_id = ${db.escape(Number(r.drafts[0].device_conversation_id))} AND ${r.whereAccount()}`;

        await db.query(sql);

        res.json(new BaseResponse);

        // Send websocket message
        r.drafts.forEach(item => {
            const payload = new DraftsPayloads.replaced_drafts(
                item.device_id,
                item.device_conversation_id,
                item.data,
                item.mime_type
            );

            payload.send(r.account_id);
        });
    }));

export default router;

