var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');


function addMedia (res, account_id, message_id, data) {
    
}


router.route('/add').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.body.message_id || !req.body.data) {
        res.json(errors.missingParam);
        return
    }
    
    var toInsert = {
        account_id: req.query.account_id,
        message_id: Number(req.body.message_id),
        data: req.body.data
    }
    
    var sql = "INSERT INTO Media " + db.insertStr(toInsert);
    

    db.query(sql, res, function (result) {
        res.json({});
    });
});

router.route('/:messageId').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM Media WHERE message_id = " + mysql.escape(Number(req.params.messageId)) + " AND " + db.whereAccount(req.query.account_id) + " LIMIT 1";
    

    db.query(sql, res, function (result) {
        res.json({
            data: result[0].data.toString()
        });
    });
});

module.exports = router;
 
