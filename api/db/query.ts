import { Response } from 'express';
import format from 'pg-format'
import pg, { QueryResultRow } from 'pg';
import connection from '../db/connect.js';
import { DatabaseError } from '../models/responses/ErrorResponses.js';
import util from '../utils/util.js';

// Set to true to debug SQL queries during development
let log_queries = false;

let pool: pg.Pool  = new pg.Pool(connection());

type HeartQueryCallback = (result: pg.QueryResult[] | any[]) => any;

class Query {
    
    /**
     * Generates a WHERE statement to limit results in a table to given account_id.
     * Uses TRANSLATE_SESSION_ID()
     * @param accountId 
     */
    static whereAccount (accountId: string) {
        return "account_id = " + Query.translateSessionToAccount(accountId) + " ";
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
     * From here it is mapped to an account_id
     * @param sessionId This is what the user sends as account_id in their requests
     */
    static translateSessionToAccount (sessionId: string) {
        return "TRANSLATE_SESSION_ID(" + Query.escape(sessionId) + ")";
    }
    
    /**
     * Runs an SQL query with error handling and returns a promis with the result
     * 
     * @example
     * let result = await db.query('SELECT 1`);
     * 
     * @param sql SQL query to execute
     */
    static query (sql: string): Promise<QueryResultRow[]> {
        if (log_queries && util.env.dev()) {
            console.log(Date.now(), ' - ', sql, ';', '\n');
        }
        return new Promise((resolve, reject) => {
            pool.query(sql, function (err, result) {
                if (err) {
                    let dbError = new DatabaseError;
                    console.log(err);     
                    return reject(dbError);
                }
                return resolve(result.rows);
            });
        })
    }
    
    /**
     * Creates a comma separated list of escaped column names from an array.
     * Respects the use of "AS" in the array item to alias a column name
     * @param fields An array of strings representing column names (and optional aliases) in the database
     */
    static selectFields (fields: string[]) {
        let out: string[] = [];
        
        fields.forEach(field => {
            let parts = field.split(" AS ");
            let fieldstr = Query.escapeId(parts[0]);
            
            if (parts.length === 2) {
                // Field includes an alias using "AS"
                fieldstr += " AS " + Query.escapeId(parts[1]);
            }
            
            
            out.push(fieldstr);
        });
        
        return out.join(', ');
    }
    
    /**
     * Generates an insert string from the given items to insert
     * i.e. - (`col1`, `col2`) VALUES (val1, val2), (val3, val4)
     * @param toInsert An array of objects (items to insert) with the following structure: {col1: val1, col2: val2}
     */
    static insertStr (toInsert: any[]) {
        let cols: string[] = [];
        let vals: any[] = [];
        let out = "";

        // Get column names from the first object to insert
        Object.keys(toInsert[0]).forEach(key => {
            cols.push(Query.escapeId(key));
        });
        
        // For each item to insert, push to vals
        toInsert.forEach((item: any) => {
            // Stores each item's list of values
            let val: string[] = [];

            Object.keys(item).forEach(key => {
                if (key == 'account_id') {
                    // Translate session id to account id using MYSQL function
                    val.push(Query.translateSessionToAccount(item[key]));
                } else {
                    // Add escaped value of item to that item's val array
                    val.push(Query.escape(item[key]));
                }
            });

            // Push the val array of the item to be inserted to the list of items to be inserted
            vals.push(val);
        });

        // Stringify column definitions for query
        // i.e. (`col1`, `col2`) VALUES 
        out += " (" + cols.join(", ") + ") VALUES ";

        let valStr: string[] = [];
        vals.forEach((val: string[]) => {
            // Push each item's values to the values string
            // i.e. - (val1, val2)
            valStr.push(" (" + val.join(", ") + ") ");
        });

        // Combine the values in the valStr array
        // i.e. - (val1, val2), (val3, val4)
        out += valStr.join(", ");
        
        // Return the full insert string
        // i.e. - (`col1`, `col2`) VALUES (val1, val2), (val3, val4)
        return out;
    }
    
    /**
     * Generates an update string from the given values
     * i.e. - `col1` = val1, `col2` = val2
     * @param toUpdate Object with the following structure: {col1: val1, col2: val2}
     */
    static updateStr (toUpdate: any) {
        let out: any[] = [];
        
        // Loop through the keys in the 
        Object.keys(toUpdate).forEach((key: string) => {
            if (toUpdate[key] != undefined) {
                // Value is defined, generate a key/value pair
                // i.e. - `col1` = val1
                out.push(Query.escapeId(key) + " = " + Query.escape(toUpdate[key]));
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
    static escapeAll (toEscape: any) {
        let out: any[] = [];

        toEscape.forEach((item: any) => {
            out.push(Query.escape(item));
        });

        return out.join(', ');
    }

}

export default Query;
