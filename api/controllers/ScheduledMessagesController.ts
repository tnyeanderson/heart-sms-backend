import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as ScheduledMessagesPayloads from '../models/payloads/ScheduledMessagesPayloads.js';
import { AccountIdRequest, DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { ScheduledMessagesAddRequest, ScheduledMessagesUpdateRequest } from '../models/requests/ScheduledMessagesRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { ScheduledMessagesListResponse } from '../models/responses/ScheduledMessagesResponses.js';

const router = express.Router();

const table = "ScheduledMessages"

router.route('/').get(
	(req, res, next) => AccountIdRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: AccountIdRequest = res.locals.request;

		const fields = ['session_id AS account_id', 'id', 'device_id', 'to', 'data',
			'mime_type', 'timestamp', 'title', 'repeat']

		const sql = `SELECT ${db.selectFields(fields)} FROM ${table}
			INNER JOIN SessionMap USING (account_id)
			WHERE ${r.whereAccount()} ${db.newestFirst(table)}`;

		const result = await db.query(sql);

		res.json(ScheduledMessagesListResponse.getList(result));
	}));

router.route('/add').post(
	(req, res, next) => ScheduledMessagesAddRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: ScheduledMessagesAddRequest = res.locals.request;

		const items = r.scheduled_messages.map((item) => {
			return Object.assign({ account_id: r.account_id }, item,);
		});

		// Generate a query for each item
		const sql = db.insertQueries(table, items);

		await db.transaction(sql);

		res.json(new BaseResponse);

		// Send websocket message
		for (const item of items) {
			const payload = new ScheduledMessagesPayloads.added_scheduled_message(item);
			await payload.send(r.account_id);
		}
	}));

router.route('/remove/:device_id').post(
	(req, res, next) => DeviceIdRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: DeviceIdRequest = res.locals.request;

		const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${db.whereAccount(r.account_id)}`;

		await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new ScheduledMessagesPayloads.removed_scheduled_message(r);
		payload.send(r.account_id);
	}));

router.route('/update/:device_id').post(
	(req, res, next) => ScheduledMessagesUpdateRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: ScheduledMessagesUpdateRequest = res.locals.request;

		const payloadFields = ["device_id AS id", "to", "data", "mime_type", "timestamp", "title", "repeat"];

		const sql = `UPDATE ${table} SET ${r.updateStr()}
			WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}
			RETURNING ${db.selectFields(payloadFields)}`;

		const result = await db.query(sql);

		res.json(new BaseResponse);

		const payload = new ScheduledMessagesPayloads.updated_scheduled_message(result[0]);
		payload.send(r.account_id);
	}));

export default router;

