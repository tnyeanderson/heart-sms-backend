// https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_http#what-must-my-web-server-do

const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const crypto = require('crypto');
const stream = require('./StreamController');

function deny (res) {
    res.status(401).json({
        Ok: false,
        Error: errors.auth.error
    });
}

function allow (res) {
    res.json({
        Ok: true
    });
}


router.route('/login').post(function (req, res) {
    // This is called by mosquitto-go-auth to authenticate the user for messaging
    // It just sends a different result from the /accounts/login endpoint

    // Since we control auth, always accept our own requests
    if (req.body.username === 'heart-sms-backend' && req.body.password && req.body.password === stream.backendPassword) {
        allow(res);
        return;
    }

    let sql = "SELECT `session_id` FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = " + db.escape(req.body.username) + " LIMIT 1";
    
    db.query(sql, res, function (result) {
        if (!result[0]) {
            deny(res);
            return;
        }
        
        if (req.body.password && req.body.password === result[0].account_id) {
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

    let sql = "SELECT `session_id` FROM Accounts INNER JOIN SessionMap USING (account_id) WHERE username = " + db.escape(req.body.username) + " LIMIT 1";
    
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

module.exports = router;