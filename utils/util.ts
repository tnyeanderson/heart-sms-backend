import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const util = {
    
    getAccountId: function (req: Request) {
        return req.query.account_id || req.body.account_id || null;
    },
    
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    },
    
    env: {
        dev: () => (process.env.NODE_ENV === 'dev'),

        test: () => (process.env.NODE_ENV === 'test'),

        devOrTest: () => (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'),

        prod: () => (process.env.NODE_ENV === 'production')
    }
}

export default util;
