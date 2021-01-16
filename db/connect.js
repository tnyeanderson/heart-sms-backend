var mysql = require('mysql');

var mysql_host = process.env.DB_HOST || 'localhost';
var mysql_port = process.env.MYSQL_PORT || 3306;
var mysql_user = process.env.MYSQL_USER || 'heart';
var mysql_pass = process.env.MYSQL_PASSWORD || 'TESTPASSWORD2';

// If we are in production, refuse to use the default password
if (process.env.NODE_ENV === 'production' && mysql_pass === 'TESTPASSWORD2') {
    console.log("ERROR: You cannot use the default MYSQL password in production. Change it in .db.env");
    return;
}

// Set db name based on environmnet
var mysql_db = process.env.MYSQL_DATABASE || 'heartsms'; // default
if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
    mysql_db = 'heartsms-dev';
}

console.log("Using database: ", mysql_db);

var base_settings = {
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

var config = function (extraSettings) {
    var out = base_settings;
    
    if (extraSettings) {
        Object.keys(extraSettings).forEach(key => {
            out[key] = extraSettings[key];
        });
    }
    
    return out;
}

module.exports = config;
    
