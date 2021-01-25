const mysql = require('mysql');
const util = require('../utils/util');

const dbDefaultPass = 'TESTPASSWORD2';

const dbHost = (util.env.test()) ? 'localhost' : (process.env.DB_HOST || 'localhost');
const dbName   = (util.env.devOrTest()) ? 'heartsms-dev' : (process.env.MYSQL_DATABASE || 'heartsms');
const dbPort = process.env.MYSQL_PORT || 3306;
const dbUser = process.env.MYSQL_USER || 'heart';
const dbPass = (util.env.test()) ? dbDefaultPass : (process.env.MYSQL_PASSWORD || dbDefaultPass);

// If we are in production, refuse to use the default password
if (util.env.prod() && dbPass === dbDefaultPass) {
    console.log("ERROR: You cannot use the default MYSQL password in production. Change it in .db.env");
    return;
}

console.log("Using database: " + dbHost + ":" + dbName);

const baseSettings = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
    database: dbName,
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
    let out = baseSettings;
    
    if (extraSettings) {
        Object.keys(extraSettings).forEach(key => {
            out[key] = extraSettings[key];
        });
    }
    
    return out;
}

module.exports = config;
    
