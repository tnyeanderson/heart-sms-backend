var mysql = require('mysql');
var poolConf = require('../db/connect');

var pool  = mysql.createPool(poolConf());
var multiquerypool  = mysql.createPool(poolConf({multipleStatements: true}));

var out = {
    
    whereAccount: function (accountId) {
        return "account_id = " + mysql.escape(accountId);
    },
    
    quote: function (str) {
        return "'" + str + "'";
    },
    
    query: function (sql, res, callback) {
        console.log(sql, ';', '\n');
        pool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                
                res.status(400).json({
                    error: "Could not query database"
                });
                
                return
            }
            callback(result);
        });
    },
    
    queries: function (sqls, res, callback) {
        var sql = sqls.join('; ');
        console.log(sql, ';', '\n');
        multiquerypool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                
                res.status(400).json({
                    error: "Could not query database"
                });
                
                return
            }
            callback(result);
        });
    },
    
    insertStr: function (toInsert) {
        var cols = [];
        var vals = [];
        
        Object.keys(toInsert).forEach(key => {
            cols.push(mysql.escapeId(key));
            vals.push(mysql.escape(toInsert[key]));
        });
        
        return " (" + cols.join(", ") + ") VALUES (" + vals.join(", ") + ")";
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
