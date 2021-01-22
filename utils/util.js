const { v4: uuidv4 } = require('uuid');

const util = {
    
    getAccountId: function (req) {
        return req.query.account_id || req.body.account_id || null;
    },
    
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    },
    
    renameKeys: function (obj, keys=[], renameTo=[]) {
        let out = {};
        
        Object.keys(obj).forEach(key => {
            let i = keys.indexOf(key);
            
            if (i !== -1) {
                out[renameTo[i]] = obj[key];
            } else {
                out[key] = obj[key]
            }
        });
        
        return out;
    },
    
    keepOnlyKeys: function (obj, keysToKeep) {
        let out = {};
        
        Object.keys(obj).forEach(key => {
            if (keysToKeep.indexOf(key) > -1)  {
                out[key] = obj[key];
            }
        });
        
        return out;
    },
    
    devOrTesting: function () {
        return (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test');
    }
}

module.exports = util;
