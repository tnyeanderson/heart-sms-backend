var mysql = require('mysql');

var connect = function () {
    var con = mysql.createConnection({
        host: 'localhost',
        user: 'test',
        password: 'testpassword'
    }
    
    return con;
}

module.exports = connect;
    
