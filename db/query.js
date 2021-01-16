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
        if (process.env.NODE_ENV == 'dev') {
            console.log(sql, ';', '\n');
        }
        pool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                
                if (res.status) {
                    res.status(400).json({
                        error: "Could not query database"
                    });
                }
                
                return
            }
            callback(result);
        });
    },
    
    queries: function (sqls, res, callback) {
        var sql = sqls.join('; ');
        if (process.env.NODE_ENV == 'dev') {
            console.log(sql, ';', '\n');
        }
        multiquerypool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                
                if (res.status) {
                    res.status(400).json({
                        error: "Could not query database"
                    });
                }
                
                return
            }
            callback(result);
        });
    },
    
    selectFields: function (fields) {
        var out = [];
        
        fields.forEach(field => {
            var parts = field.split(" AS ");
            var fieldstr = mysql.escapeId(parts[0]);
            
            if (parts.length === 2) {
                fieldstr += " AS " + mysql.escapeId(parts[1]);
            }
            
            
            out.push(fieldstr);
        });
        
        return out.join(', ');
    },
    
    insertStr: function (toInsert) {
        let cols = [];
        let vals = [];
        let out = "";

        // Get column names from the first object to insert
        Object.keys(toInsert[0]).forEach(key => {
            cols.push(mysql.escapeId(key));
        });
        
        // For each item to insert, push to vals
        toInsert.forEach(item => {
            let val = [];

            Object.keys(item).forEach(key => {
                val.push(mysql.escape(item[key]));
            });

            vals.push(val);
        });

        out += " (" + cols.join(", ") + ") VALUES ";

        var valStr = [];
        vals.forEach(val => {
            valStr.push(" (" + val.join(", ") + ") ");
        });

        out += valStr.join(", ");
        
        return out;
    },
    
    updateStr: function (toUpdate) {
        var out = [];
        
        Object.keys(toUpdate).forEach(key => {
            if (toUpdate[key] != undefined) {
                out.push(mysql.escapeId(key) + " = " + mysql.escape(toUpdate[key]));
            }
        });
        
        return out.join(", ");
    }

}

module.exports = out;
