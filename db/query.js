var mysql = require('mysql');
var conn = require('../db/connect');

var out = {
    query: function (sql, res, callback) {
        conn().connect(function (err) {
            if (err) {
                res.status(400).json({
                    error: "Could not connect to database"
                });
                
                return
            }
            conn().query(sql, function (err, result) {
                if (err) {
                    res.status(400).json({
                        error: "Could not query database"
                    });
                }
                callback(result);
            });
        });
    }
}

module.exports = out;
