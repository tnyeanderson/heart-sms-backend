const { v4: uuidv4 } = require('uuid');

var out = {
    
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    },
    
    renameKeys: function (obj, keys, renameTo) {
        Object.keys(obj).forEach(key => {
            var i = keys.indexOf(key);
            
            if (i !== -1) {
                obj[renameTo[i]] = obj[key];
                delete obj[key];
            }
        });
        
        return obj;
    }
    
}

module.exports = out;
