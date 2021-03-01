import { Response } from 'express';
//import mysql, { FieldInfo, Pool } from 'mysql';
import format from 'pg-format'
import pg from 'pg';
import connection from '../db/connect.js';
import { DatabaseError } from '../models/responses/ErrorResponses.js';
import util from '../utils/util.js';

// Set to true to debug SQL queries during development
let log_queries = true;

let pool: pg.Pool  = new pg.Pool(connection());

type HeartQueryCallback = (result: pg.QueryResult[] | any[]) => any;

let Query = {
    
    /**
     * Generates a WHERE statement to limit results in a table to given account_id.
     * Uses TRANSLATE_SESSION_ID()
     * @param accountId 
     */
    whereAccount: function (accountId: string) {
        return "account_id = " + Query.translateSessionToAccount(accountId) + " ";
    },

    /**
     * Generate the LIMIT/OFFSET portion of a query
     * @param limit 
     * @param offset 
     */
    limitStr: function (limit: number, offset: number) {
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
    },
    
    /**
     * Escape a value before using it in an SQL query
     * @param item 
     */
    escape: function (item: string | string[] | number | boolean) {
        return format.literal(item);
    },

    /**
     * Escape an ID (table name, column name, etc) before using it in an SQL query
     * @param item 
     */
    escapeId: function (item: string) {
        return format.ident(item);
    },

    /**
     * TRANSLATE_SESSION_ID mysql function returns an account_id from a session_id
     * To the user, it is called account_id, but in the database,
     * it is actually stored as session_id in the SessionMap table.
     * The SessionMap table associates the 64 character session_id to a primary key of the Accounts table.
     * account_id is actually an auto incremented field, and the foreign key for other tables
     * From here it is mapped to an account_id
     * @param sessionId This is what the user sends as account_id in their requests
     */
    translateSessionToAccount: function (sessionId: string) {
        return "TRANSLATE_SESSION_ID(" + Query.escape(sessionId) + ")";
    },
    
    /**
     * Runs an SQL query with error handling and returns the result
     * @param sql SQL query to execute
     * @param res Express response object
     * @param callback function to run on completion
     */
    query: function (sql: string, res: Response, callback: HeartQueryCallback) {
        if (log_queries && util.env.dev()) {
            console.log(Date.now(), ' - ', sql, ';', '\n');
        }
        pool.query(sql, function (err, result) {
            if (err) {
                let dbError = new DatabaseError;
                console.log(err);
                
                if (res) {
                    // TODO: Database errors lock up the server for a few seconds
                    res.status(dbError.status!).json(dbError.msg);
                }
                
                return;
            }
            callback(result.rows);
        });
    },
    
    /**
     * Creates a comma separated list of escaped column names from an array.
     * Respects the use of "AS" in the array item to alias a column name
     * @param fields An array of strings representing column names (and optional aliases) in the database
     */
    selectFields: function (fields: string[]) {
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
    },
    
    /**
     * Generates an insert string from the given items to insert
     * i.e. - (`col1`, `col2`) VALUES (val1, val2), (val3, val4)
     * @param toInsert An array of objects (items to insert) with the following structure: {col1: val1, col2: val2}
     */
    insertStr: function (toInsert: any[]) {
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
    },
    
    /**
     * Generates an update string from the given values
     * i.e. - `col1` = val1, `col2` = val2
     * @param toUpdate Object with the following structure: {col1: val1, col2: val2}
     */
    updateStr: function (toUpdate: any) {
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
    },

    /**
     * Escape all the values in an array.
     * Return escaped values separated by commas
     * @param toEscape Array of values to escape
     */
    escapeAll: function (toEscape: any) {
        let out: any[] = [];

        toEscape.forEach((item: any) => {
            out.push(Query.escape(item));
        });

        return out.join(', ');
    }

}

export default Query;
