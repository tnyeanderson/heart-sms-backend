import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const util = {
    
    /**
     * Generate a 64 character account id using two UUIDs
     */
    createAccountId: function () {
        return (uuidv4() + uuidv4()).replace(/-/g, '');
    },
    
    /**
     * Used for easily determining which environment we are in
     */
    env: {
        dev: () => (process.env.NODE_ENV === 'dev'),

        test: () => (process.env.NODE_ENV === 'test'),

        devOrTest: () => (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'),

        prod: () => (process.env.NODE_ENV === 'production')
    }
}

export default util;
