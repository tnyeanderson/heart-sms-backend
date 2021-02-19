import { ConnectionConfig } from 'mysql';
import { DefaultDatabasePasswordError } from '../models/errors/Errors.js';
import util from '../utils/util.js';

const dbDefaultPass: string = 'TESTPASSWORD2';

const dbHost: string = (util.env.test()) ? 'localhost' : (process.env.DB_HOST || 'localhost');
const dbName: string = (util.env.devOrTest()) ? 'heartsms-dev' : (process.env.MYSQL_DATABASE || 'heartsms');
const dbPort: number = Number(process.env.MYSQL_PORT) || 3306;
const dbUser: string = process.env.MYSQL_USER || 'heart';
const dbPass: string = (util.env.test()) ? dbDefaultPass : (process.env.MYSQL_PASSWORD || dbDefaultPass);

// If we are in production, refuse to use the default password
if (util.env.prod() && dbPass === dbDefaultPass) {
    let defaultPasswordError = new DefaultDatabasePasswordError;
    console.log(defaultPasswordError);
    throw defaultPasswordError;
}

console.log("Using database: " + dbHost + ":" + dbName);

const baseSettings: ConnectionConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
    database: dbName,
    typeCast: function (field, next) {
        // Cast TINYINT(1) to boolean
        if (field.type === 'TINY' && field.length === 1) {
            return (field.string() === '1'); // 1 = true, 0 = false
        } else {
            return next();
        }
    }
}

const connection = function (extraSettings?: ConnectionConfig) {
    return Object.assign({}, baseSettings, extraSettings);
}

export default connection;
    
