import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const devEnv = 'dev';
const testEnv = 'test';
const prodEnv = 'production';

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
        dev: () => (process.env.NODE_ENV === devEnv),

        test: () => (process.env.NODE_ENV === testEnv),

        devOrTest: () => (process.env.NODE_ENV === devEnv || process.env.NODE_ENV === testEnv),

        prod: () => (!process.env.NODE_ENV || process.env.NODE_ENV === prodEnv), // Prod is default

        pretty: function () {
            switch (process.env.NODE_ENV) {
                case devEnv : return 'Development';
                case testEnv: return 'Test';
                case prodEnv: return 'Production';
                default: return 'Production';
            }
        }
    }
}

export default util;
