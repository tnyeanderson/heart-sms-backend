import express from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import * as MessagesPayloads from '../models/payloads/MessagesPayloads.js';
import { DeviceIdRequest } from '../models/requests/BaseRequests.js';
import { MessagesAddRequest, MessagesCleanupRequest, MessagesForwardToPhoneRequest, MessagesGetRequest, MessagesUpdateRequest, MessagesUpdateTypeRequest } from '../models/requests/MessagesRequests.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { MessagesListResponse } from '../models/responses/MessagesResponses.js';

const router = express.Router();

const table = 'Messages';

router.route('/').get(
	(req, res, next) => MessagesGetRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: MessagesGetRequest = res.locals.request;

		const fields = ['session_id AS account_id', 'id', 'device_id',
			'device_conversation_id', 'message_type', 'data',
			'timestamp', 'mime_type', 'read', 'seen', 'message_from',
			'color', 'sent_device', 'sim_stamp'];

		let whereConversationStr = '';

		if (r.conversation_id) {
			whereConversationStr = ` AND device_conversation_id =  ${db.escape(Number(r.conversation_id))} `;
		}

		const sql = `SELECT ${db.selectFields(fields)} FROM ${table}
			INNER JOIN SessionMap USING (account_id)
			WHERE ${r.whereAccount()} ${whereConversationStr}
			ORDER BY timestamp DESC ${r.limitStr()}`;

		const result = await db.query(sql);

		res.json(MessagesListResponse.getList(result));
	}));

router.route('/remove/:device_id').post(
	(req, res, next) => DeviceIdRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: DeviceIdRequest = res.locals.request;

		const sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

		await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new MessagesPayloads.removed_message(r);
		payload.send(r.account_id);
	}));

router.route('/add').post(
	(req, res, next) => MessagesAddRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: MessagesAddRequest = res.locals.request;

		const items = r.messages.map(item => {
			return Object.assign({ account_id: r.account_id }, item);
		});

		// Generate a query for each item
		const sql = db.insertQueries(table, items);

		await db.transaction(sql);

		res.json(new BaseResponse);

		// Send websocket message
		// TODO: Fix linting
		items.forEach((item: any) => {
			const payload = new MessagesPayloads.added_message(item);
			payload.send(r.account_id);
		});
	}));

router.route('/update/:device_id').post(
	(req, res, next) => MessagesUpdateRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: MessagesUpdateRequest = res.locals.request;

		const payloadFields = ['device_id AS id', 'message_type AS type', 'timestamp'];

		const sql = `UPDATE ${table} SET ${r.updateStr()}
			WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}
			RETURNING ${db.selectFields(payloadFields)}`;

		const result = await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new MessagesPayloads.updated_message(Object.assign({}, result[0], r));
		payload.send(r.account_id);
	}));

router.route('/update_type/:device_id').post(
	(req, res, next) => MessagesUpdateTypeRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: MessagesUpdateTypeRequest = res.locals.request;

		const sql = `UPDATE ${table} SET ${r.updateStr()} WHERE device_id = ${db.escape(Number(r.device_id))} AND ${r.whereAccount()}`;

		await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new MessagesPayloads.update_message_type(r);
		payload.send(r.account_id);
	}));

router.route('/cleanup').post(
	(req, res, next) => MessagesCleanupRequest.handler(req, res, next),
	asyncHandler(async (req, res) => {
		const r: MessagesCleanupRequest = res.locals.request;

		const sql = `DELETE FROM ${table} WHERE timestamp < ${db.escape(Number(r.timestamp))} AND ${r.whereAccount()}`;

		await db.query(sql);

		res.json(new BaseResponse);

		// Send websocket message
		const payload = new MessagesPayloads.cleanup_messages(r);
		payload.send(r.account_id);
	}));

router.route('/forward_to_phone').post(
	(req, res, next) => MessagesForwardToPhoneRequest.handler(req, res, next),
	function (req, res) {
		const r: MessagesForwardToPhoneRequest = res.locals.request;

		// Send websocket message
		const payload = new MessagesPayloads.forward_to_phone(r);
		payload.send(r.account_id);

		res.json(new BaseResponse);
	});

export default router;

