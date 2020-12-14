var mysql = require('mysql');

var settings = {
    host: 'localhost',
    port: 8000,
    user: 'test',
    password: 'testpassword',
    database: 'heartsms',
    typeCast: function (field, next) {
        // Cast TINYINT(1) to boolean
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1'); // 1 = true, 0 = false
        } else {
            return next();
        }
    }
}

var connect = function (extraSettings) {
    if (extraSettings) {
        Object.keys(extraSettings).forEach(key => {
            settings[key] = extraSettings[key];
        });
    }
    
    var con = mysql.createConnection(settings);
    
    return con;
}

module.exports = connect;
    
