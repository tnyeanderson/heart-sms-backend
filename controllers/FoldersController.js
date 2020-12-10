var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var conn = require('../db/connect');

var routes = function () {
    router.route('/').get(function (req, res) {
        conn.connect().then(function (err) {]
            if (err) {
                res.status(400).json({
                    error: "Could not connect to database"
                });
            }
            var sql = "SQLQUERY"
            conn.query(sql, function (err, result) {
                if (err) {
                    res.status(400).json({
                        error: "Could not query database"
                    });
                }
                res.json(result);
            }
        }
    }
}

module.exports = routes;
 
