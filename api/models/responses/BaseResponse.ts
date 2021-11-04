import { FieldInfo } from "mysql";
import { QueryResult } from "pg";
import util from "../../utils/util.js";

export class BaseResponse {
    constructor(r?: any) { }
    
    /**
     * Creates an instance of the calling class from a result
     * @param result Array of results, usually from a database or API call
     */
    static fromResult (result: FieldInfo[] | any[]) {
        return new this(result[0]);
    }


    /**
     * Creates an array of instances of the calling class from a result
     * Used for GET results which are arrays of items
     * @param result Array of results, usually from a database or API call
     */
    static getList (result: QueryResult[] | any[]) {
        return (result as any[]).map((item: any) => this.fromResult([item]))
    }

    /**
     * 
     * @param name The name of the property
     * @param sourceObj The object to get the property from
     * @param Cast The function used to cast the value to the proper type
     */
    setOptional(name: string, sourceObj: any, Cast: Function) {
        if (!util.propMissing(sourceObj, name)) {
            // @ts-expect-error TS7053
            this[name] = Cast(sourceObj[name])
        }
    }
}