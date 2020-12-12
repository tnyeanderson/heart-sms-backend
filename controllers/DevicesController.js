var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');

var table = "Devices"

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + "WHERE " + query.whereAccount(req.query.account_id);
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/remove/:id').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + "WHERE id = '" + mysql.escape(req.params.id) + "' AND " + query.whereAccount(req.query.account_id);
    console.log(sql);

    db.query(sql, res, function (result) {
        res.json(result);
    });
});

module.exports = router;
 
