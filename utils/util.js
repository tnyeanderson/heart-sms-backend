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
    },
    
    keepOnlyKeys: function (obj, keysToKeep) {
        var out = {};
        
        Object.keys(obj).forEach(key => {
            if (keysToKeep.indexOf(key))  {
                out[key] = obj[key];
            }
        });
        
        return out;
    }
    
}

module.exports = out;
