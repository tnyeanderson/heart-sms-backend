import express, { Response } from 'express';
import db from '../db/query.js';
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


router.route('/login').post(function (req, res) {
    // This is called by mosquitto-go-auth to authenticate the user for messaging
    // It just sends a different result from the /accounts/login endpoint

    // Since we control auth, always accept our own requests
    if (req.body.username === 'heart-sms-backend' && req.body.password && req.body.password === stream.backendPassword) {
        allow(res);
        return;
    }

    let sql = `SELECT ${db.escapeId('session_id')} FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = ${db.escape(req.body.username)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        if (!result[0]) {
            deny(res);
            return;
        }
        
        if (req.body.password && req.body.password === result[0].session_id) {
            allow(res);
        } else {
            deny(res);
        }
    });
});


router.route('/acl').post(function (req, res) {
    // Since we control auth, always accept our own requests
    if (req.body.username === 'heart-sms-backend') {
        allow(res);
        return;
    }

    let sql = `SELECT ${db.escapeId('session_id')} FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = ${db.escape(req.body.username)} LIMIT 1`;
    
    db.query(sql, res, function (result) {
        if (!result[0]) {
            deny(res);
            return;
        }
        
        if (req.body.topic === 'heartsms/' + result[0].session_id) {
            allow(res);
        } else {
            deny(res);
        }
    });

    
});

export default router;