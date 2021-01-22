const mysql = require('mysql');
const util = require('../utils/util');

const mysql_host = (util.devOrTesting()) ? 'localhost' : (process.env.DB_HOST || 'localhost');
const mysql_db   = (util.devOrTesting()) ? 'heartsms' : (process.env.MYSQL_DATABASE || 'heartsms');
const mysql_port = process.env.MYSQL_PORT || 3306;
const mysql_user = process.env.MYSQL_USER || 'heart';
const mysql_pass = process.env.MYSQL_PASSWORD || 'TESTPASSWORD2';

// If we are in production, refuse to use the default password
if (process.env.NODE_ENV === 'production' && mysql_pass === 'TESTPASSWORD2') {
    console.log("ERROR: You cannot use the default MYSQL password in production. Change it in .db.env");
    return;
}

console.log("Using database: ", mysql_db);

const base_settings = {
    host: mysql_host,
    port: mysql_port,
    user: mysql_user,
    password: mysql_pass,
    database: mysql_db,
    typeCast: function (field, next) {
        // Cast TINYINT(1) to boolean
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1'); // 1 = true, 0 = false
        } else {
            return next();
        }
    }
}

const config = function (extraSettings) {
    let out = base_settings;
    
    if (extraSettings) {
        Object.keys(extraSettings).forEach(key => {
            out[key] = extraSettings[key];
        });
    }
    
    return out;
}

module.exports = config;
    
