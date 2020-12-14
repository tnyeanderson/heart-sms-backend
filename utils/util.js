const { v4: uuidv4 } = require('uuid');

var out = {
    
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    }
    
}

module.exports = out;
