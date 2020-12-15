var mysql = require('mysql');
var conn = require('../db/connect');

var out = {
    
    whereAccount: function (accountId) {
        return "account_id = " + mysql.escape(accountId);
    },
    
    quote: function (str) {
        return "'" + str + "'";
    },
    
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
                    return
                }
                callback(result);
            });
        });
    },
    
    queries: function (sqls, res, callback) {
        var sql = sqls.join('; ');
        
        conn({multipleStatements: true}).connect(function (err) {
            if (err) {
                res.status(400).json({
                    error: "Could not connect to database"
                });
                
                return
            }
            conn({multipleStatements: true}).query(sql, function (err, result) {
                if (err) {
                    res.status(400).json({
                        error: "Could not query database"
                    });
                    return
                }
                callback(result);
            });
        });
    },
    
    updateStr: function (cols, values) {
        var out = [];
        
        for (var i=0, len=cols.length; i<len; i++) {
            if (values[i] || values[i] != "''") {
                out.push(cols[i] + " = " + values[i]);
            }
        }
        
        return out.join(", ");
    }

}

module.exports = out;
