import express, { Response } from 'express';
import db from '../db/query.js';
import { asyncHandler } from '../helpers/AsyncHandler.js';
import { MQTTAclRequest, MQTTLoginRequest } from '../models/requests/MQTTRequests.js';
import { MQTTAllowResponse, MQTTDenyResponse } from '../models/responses/MQTTResponses.js';
import stream from './StreamController.js';

// https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_http#what-must-my-web-server-do

const router = express.Router();

function deny (res: Response) {
    res.status(401).json(new MQTTDenyResponse);
}

function allow (res: Response) {
    res.json(new MQTTAllowResponse);
}


router.route('/login').post(
    (req, res, next) => MQTTLoginRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: MQTTLoginRequest = res.locals.request;

        // This is called by mosquitto-go-auth to authenticate the user for messaging
        // It just sends a different result from the /accounts/login endpoint

        // Since we control auth, always accept our own requests
        if (r.username === 'heart-sms-backend' && r.password && r.password === stream.backendPassword) {
            return allow(res);
        }

        const sql = `SELECT ${db.escapeId('session_id')} FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = ${db.escape(r.username)} LIMIT 1`;

        const result = await db.query(sql);

        if (!result[0]) {
            return deny(res);
        }

        if (r.password && r.password === result[0].session_id) {
            return allow(res);
        } else {
            return deny(res);
        }
    }));


router.route('/acl').post(
    (req, res, next) => MQTTAclRequest.handler(req, res, next),
    asyncHandler(async (req, res) => {
        const r: MQTTAclRequest = res.locals.request;

        // Since we control auth, always accept our own requests
        if (r.username === 'heart-sms-backend') {
            allow(res);
            return;
        }

        const sql = `SELECT ${db.escapeId('session_id')} FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = ${db.escape(r.username)} LIMIT 1`;

        const result = await db.query(sql);

        if (!result[0]) {
            deny(res);
            return;
        }

        if (r.topic === 'heartsms/' + result[0].session_id) {
            allow(res);
        } else {
            deny(res);
        }
    }));

export default router;