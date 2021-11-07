import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as AutoRepliesPayloads from '../models/payloads/AutoRepliesPayloads.js';
import { BasePayload } from '../models/payloads/BasePayload.js';
import { AutoRepliesAddRequest, AutoRepliesUpdateRequest } from '../models/requests/AutoRepliesRequests.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { AutoRepliesListResponse } from '../models/responses/AutoRepliesResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';

const router = express.Router();

const table = "AutoReplies"

router.route('/').get(
	(req, res, next) => AccountIdRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: AccountIdRequest = res.locals.request;

		const fields = ['session_id AS account_id', 'id', 'device_id', 'reply_type', 'pattern', 'response']

		const sql = `SELECT ${db.selectFields(fields)} FROM ${table}
			INNER JOIN SessionMap USING (account_id)
			WHERE ${r.whereAccount()} ${db.newestFirst(table)}`;

		const result = await db.query(sql);

		res.json(AutoRepliesListResponse.getList(result));
	}));

router.route('/add').post(
	(req, res, next) => AutoRepliesAddRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: AutoRepliesAddRequest = res.locals.request;

		const items = r.auto_replies.map((item) => {
			return Object.assign({ account_id: r.account_id }, item);
		});

		// Generate a query for each item
		const sql = db.insertQueries(table, items);

		await db.transaction(sql);

		res.json(new BaseResponse);

		// Send websocket message
		items.forEach(function (item) {
			const payload = new AutoRepliesPayloads.added_auto_reply(
				item.device_id,
				item.reply_type,
				item.pattern,
				item.response
			);

			payload.send(r.account_id);
		});
	}));

router.route('/remove/:device_id').post(
	(req, res, next) => DeviceIdRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: DeviceIdRequest = res.locals.request;

		const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

		await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new AutoRepliesPayloads.removed_auto_reply(
			Number(r.device_id)
		);

		payload.send(r.account_id);
	}));

router.route('/update/:device_id').post(
	(req, res, next) => AutoRepliesUpdateRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: AutoRepliesUpdateRequest = res.locals.request;

		const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

		await db.query(sql);

		res.json(new BasePayload);

		const payload = new AutoRepliesPayloads.updated_auto_reply(
			Number(r.device_id),
			r.reply_type,
			r.pattern,
			r.response
		);

		payload.send(r.account_id);
	}));

export default router;

