import pg, { QueryResultRow } from 'pg';
import format from 'pg-format';
import connection from '../db/connect.js';
import { DatabaseError } from '../models/responses/ErrorResponses.js';
import util from '../utils/util.js';

// Set to true to debug SQL queries during development
const log_queries = false;

const pool: pg.Pool  = new pg.Pool(connection());

class Query {

    /**
     * Order the results by most recently updated
     * @param table
     */
    static newestFirst (table: string) {
        return `ORDER BY ${table}.updated_at DESC`;
    }

    /**
     * Generates a WHERE statement to limit results in a table to given account_id.
     * Uses TRANSLATE_SESSION_ID()
     * @param accountId
     */
    static whereAccount (accountId: string) {
        return `account_id = ${Query.translateSessionToAccount(accountId)} `;
    }

    /**
     * Generate the LIMIT/OFFSET portion of a query
     * @param limit
     * @param offset
     */
    static limitStr (limit: number, offset: number) {
        let out = '';

        if (limit > 0) {
            // Limit is set
            out += ` LIMIT ${Query.escape(limit)}`;
            if (offset > 0) {
                // Offset is set
                out += ` OFFSET ${Query.escape(offset)}`;
            }
        }

        return out;
    }

    /**
     * Escape a value before using it in an SQL query
     * @param item
     */
    static escape (item: string | string[] | number | boolean) {
        return format.literal(item);
    }

    /**
     * Escape an ID (table name, column name, etc) before using it in an SQL query
     * @param item
     */
    static escapeId (item: string) {
        return format.ident(item);
    }

    /**
     * TRANSLATE_SESSION_ID mysql function returns an account_id from a session_id.
     * To the user, it is called account_id, but in the database,
     * it is actually stored as session_id in the SessionMap table.
     * The SessionMap table associates the 64 character session_id to a primary key of the Accounts table.
     * account_id is actually an auto incremented field, and the foreign key for other tables
     * From here the user-provided "account_id" (stored as a session_id) is mapped to an actual account_id
     * @param sessionId This is what the user sends as account_id in their requests
     */
    static translateSessionToAccount (sessionId: string) {
        return `TRANSLATE_SESSION_ID(${Query.escape(sessionId)})`;
    }

    /**
     * Runs an SQL query with error handling and returns a promise with the result
     *
     * @example
     * const result = await db.query('SELECT 1`);
     *
     * @param sql SQL query to execute
     */
    static async query (sql: string): Promise<QueryResultRow[]> {
        if (log_queries && util.env.dev()) {
            console.log(Date.now(), ' - ', sql, ';', '\n');
        }

        try {
            const res = await pool.query(sql);
            return res.rows;
        } catch (err) {
            const dbError = new DatabaseError;
            console.log(err);
            throw dbError;
        }
    }

    /**
     * Runs an SQL query within a transaction that automatically rolls back upon error
     *
     * @example
     * const result = await db.transaction('SELECT col_that_does_not_exist');
     *
     * @param sql SQL query to execute within a transaction
     */
    static async transaction (sql: string): Promise<QueryResultRow[]> {
        await this.query('BEGIN');

        try {
            const rows = await this.query(sql);
            await this.query('COMMIT');
            return rows;
        } catch (err) {
            await this.query('ROLLBACK');
            throw err;
        }
    }

    /**
     * Creates a comma separated list of escaped column names from an array.
     * Respects the use of "AS" in the array item to alias a column name
     * @param fields An array of strings representing column names (and optional aliases) in the database
     */
    static selectFields (fields: string[]) {
        const out: string[] = [];

        fields.forEach(field => {
            const parts = field.split(" AS ");
            let fieldstr = Query.escapeId(parts[0]);

            if (parts.length === 2) {
                // Field includes an alias using "AS"
                fieldstr += ` AS ${Query.escapeId(parts[1])}`;
            }


            out.push(fieldstr);
        });

        return out.join(', ');
    }

    static insertQueries (table: string, items: unknown[]) {
        const queries = items.map((item) => {
            return `INSERT INTO ${table} ${this.insertStr(item)}`;
        })

        return queries.join('; ');
    }

    /**
     * Generates an insert string from the given items to insert
     * i.e. - (`col1`, `col2`) VALUES (val1, val2), (val3, val4)
     * @param toInsert An array of objects (items to insert) with the following structure: {col1: val1, col2: val2}
     */
    static insertStr (toInsert: unknown | unknown[]) {
        // If toInsert is not an array, make it one
        const items = Array.isArray(toInsert) ? toInsert : [toInsert];

        // Get column names from the first object to insert
        const cols = Object.keys(items[0]).map(key => Query.escapeId(key));

        // For each item to insert, push to vals
        const vals = items.map((item) => {
            // Push the val array of the item to be inserted to the list of items to be inserted
            return Object.entries(item).map(([key, value]) => {
                if (key == 'account_id') {
                    // Translate session id to account id using MYSQL function
                    return Query.translateSessionToAccount(value as string);
                } else {
                    // Add escaped value of item to that item's val array
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return Query.escape(value as any);
                }
            });
        });

        // Push each item's values to the values string
        // i.e. - (val1, val2)
        const valStr = vals.map((val) => ` (${val.join(", ")}) `);

        // Return the full insert string
        // i.e. - (`col1`, `col2`) VALUES (val1, val2), (val3, val4)
        return ` (${cols.join(", ")}) VALUES ${valStr.join(", ")}`;
    }

    /**
     * Generates an update string from the given values
     * i.e. - `col1` = val1, `col2` = val2
     * @param toUpdate Object with the following structure: {col1: val1, col2: val2}
     */
    static updateStr (toUpdate: object) {
        const out = Object.entries(toUpdate).map(([key, value]) => {
            if (value !== undefined) {
                // Value is defined, generate a key/value pair
                // i.e. - `col1` = val1
                return `${Query.escapeId(key)} = ${Query.escape(value)}`;
            }
        });

        // Stringify the results with comma separator
        // i.e. - `col1` = val1, `col2` = val2
        return out.join(", ");
    }

    /**
     * Escape all the values in an array.
     * Return escaped values separated by commas
     * @param toEscape Array of values to escape
     */
    static escapeAll (toEscape: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return toEscape.map((item: any) => Query.escape(item)).join(', ');
    }

}

export default Query;
