// https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_http#what-must-my-web-server-do

var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
const crypto = require('crypto');
var stream = require('./StreamController');

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
    // This is called by rabbitmq to authenticate the user for messaging
    // It just sends a different result from the /accounts/login endpoint

    // Since we control auth, always accept our own requests
    if (req.body.username === 'heart-sms-backend' && req.body.password && req.body.password === stream.backendPassword) {
        allow(res);
        return;
    }

    var sql = "SELECT `account_id` FROM Accounts WHERE username = " + mysql.escape(req.body.username) + " LIMIT 1";
    
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

    var sql = "SELECT * FROM Accounts WHERE username = " + mysql.escape(req.body.username) + " LIMIT 1";

    db.query(sql, res, function (result) {
        if (!result[0]) {
            deny(res);
            return;
        }
        
        if (req.body.topic === 'heartsms/' + result[0].account_id) {
            allow(res);
        } else {
            deny(res);
        }
    });
});

module.exports = router;