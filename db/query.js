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
        console.log(sql, '\n');
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
        console.log(sql, '\n');
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
    
    updateStr: function (toUpdate) {
        var out = [];
        
        Object.keys(toUpdate).forEach(key => {
            if (toUpdate[key] && toUpdate[key] != "''" && toUpdate[key] != 'NULL') {
                out.push("`" + key + "` = " + toUpdate[key]);
            }
        });
        
        return out.join(", ");
    }

}

module.exports = out;
