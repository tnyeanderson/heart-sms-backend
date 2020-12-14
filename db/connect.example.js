var mysql = require('mysql');

var connect = function () {
    var con = mysql.createConnection({
        host: 'localhost',
        port: 8000,
        user: 'test',
        password: 'testpassword',
        database: 'heartsms'
    });
    
    return con;
}

module.exports = connect;
    
