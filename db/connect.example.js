var mysql = require('mysql');

var base_settings = {
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
    
