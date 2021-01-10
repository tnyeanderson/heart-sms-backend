const { v4: uuidv4 } = require('uuid');

var out = {
    
    getAccountId: function (req) {
        return req.query.account_id || req.body.account_id || null;
    },
    
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    },
    
    renameKeys: function (obj, keys, renameTo) {
        var out = {};
        
        var keys = keys || [];
        var renameto = renameTo || [];
        
        Object.keys(obj).forEach(key => {
            var i = keys.indexOf(key);
            
            if (i !== -1) {
                out[renameTo[i]] = obj[key];
            } else {
                out[key] = obj[key]
            }
        });
        
        return out;
    },
    
    keepOnlyKeys: function (obj, keysToKeep) {
        var out = {};
        
        Object.keys(obj).forEach(key => {
            if (keysToKeep.indexOf(key) > -1)  {
                out[key] = obj[key];
            }
        });
        
        return out;
    }
    
}

module.exports = out;
