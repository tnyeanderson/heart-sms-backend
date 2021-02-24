import { Response } from 'express';
import mysql, { FieldInfo, Pool } from 'mysql';
import connection from '../db/connect.js';
import { DatabaseError } from '../models/responses/ErrorResponses.js';
import util from '../utils/util.js';

// Set to true to debug SQL queries during development
let log_queries = false;

let pool: Pool  = mysql.createPool(connection());

type HeartQueryCallback = (result: FieldInfo[] | any[]) => any;

let Query = {
    
    whereAccount: function (accountId: string) {
        return "account_id = " + Query.translateSessionToAccount(accountId) + " ";
    },

    limitStr: function (limit: number, offset: number) {
        let out = '';
    
        if (limit) {
            out += ` LIMIT ${Query.escape(limit)}`;
            if (offset) {
                out += ` OFFSET ${Query.escape(offset)}`;
            }
        }

        return out;
    },
    
    escape: function (item: string | string[] | number | boolean) {
        return mysql.escape(item);
    },

    escapeId: function (item: string) {
        return mysql.escapeId(item);
    },

    translateSessionToAccount: function (sessionId: string) {
        return "TRANSLATE_SESSION_ID(" + Query.escape(sessionId) + ")";
    },
    
    query: function (sql: string, res: Response, callback: HeartQueryCallback) {
        if (log_queries && util.env.dev()) {
            console.log(Date.now(), ' - ', sql, ';', '\n');
        }
        pool.query(sql, function (err, result) {
            if (err) {
                console.log(err);
                
                if (res) {
                    // TODO: Database errors lock up the server for a few seconds
                    res.json(new DatabaseError);
                }
                
                return;
            }
            callback(result);
        });
    },
    
    selectFields: function (fields: string[]) {
        let out: string[] = [];
        
        fields.forEach(field => {
            let parts = field.split(" AS ");
            let fieldstr = Query.escapeId(parts[0]);
            
            if (parts.length === 2) {
                fieldstr += " AS " + Query.escapeId(parts[1]);
            }
            
            
            out.push(fieldstr);
        });
        
        return out.join(', ');
    },
    
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
            let val: string[] = [];

            Object.keys(item).forEach(key => {
                if (key == 'account_id') {
                    // Translate session id to account id using MYSQL function
                    val.push(Query.translateSessionToAccount(item[key]));
                } else {
                    val.push(Query.escape(item[key]));
                }
            });

            vals.push(val);
        });

        out += " (" + cols.join(", ") + ") VALUES ";

        let valStr: string[] = [];
        vals.forEach((val: string[]) => {
            valStr.push(" (" + val.join(", ") + ") ");
        });

        out += valStr.join(", ");
        
        return out;
    },
    
    updateStr: function (toUpdate: any) {
        let out: any[] = [];
        
        Object.keys(toUpdate).forEach((key: string) => {
            if (toUpdate[key] != undefined) {
                out.push(Query.escapeId(key) + " = " + Query.escape(toUpdate[key]));
            }
        });
        
        return out.join(", ");
    },

    escapeAll: function (toEscape: any) {
        let out: any[] = [];

        toEscape.forEach((item: any) => {
            out.push(Query.escape(item));
        });

        return out.join(', ');
    }

}

export default Query;