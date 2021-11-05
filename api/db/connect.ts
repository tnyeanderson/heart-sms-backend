import pg from 'pg';
import { DefaultDatabasePasswordError } from '../models/errors/Errors.js';
import util from '../utils/util.js';

// Cast bigints to numbers instead of strings
pg.types.setTypeParser(20, Number);

const dbDefaultPass = 'TESTPASSWORD2';

// Get values based on environment, environment variables, or default values
const dbHost: string = (util.env.test()) ? 'localhost' : (process.env.DB_HOST || 'localhost');
const dbName: string = (util.env.devOrTest()) ? 'heartsms-dev' : (process.env.POSTGRES_DB || 'heartsms');
const dbPort: number = Number(process.env.DB_PORT) || 5432;
const dbUser: string = process.env.POSTGRES_USER || 'heart';
const dbPass: string = (util.env.test()) ? dbDefaultPass : (process.env.POSTGRES_PASSWORD || dbDefaultPass);

// If we are in production, refuse to use the default password
if (util.env.prod() && dbPass === dbDefaultPass) {
    const defaultPasswordError = new DefaultDatabasePasswordError;
    console.log(defaultPasswordError);
    throw defaultPasswordError;
}

console.log("Using database: " + dbHost + ":" + dbName);

const baseSettings: pg.PoolConfig = {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPass,
    database: dbName
}

const connection = function (extraSettings?: pg.PoolConfig) {
    // Return the base config with any extraSettings applied
    return Object.assign({}, baseSettings, extraSettings);
}

export default connection;

