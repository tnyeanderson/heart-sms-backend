import { plainToClass } from "class-transformer";
import { FieldInfo } from "mysql";

export class BaseResponse {
    cast (obj: any) {
        Object.getOwnPropertyNames(this).forEach((prop) => {
            // @ts-ignore
            this[prop] = obj[prop];
        });
    }


    /**
     * Creates an instance of the calling class from a result based on Expose annotations
     * @param result Array of results, usually from a database or API call
     */
    static fromResult (result: FieldInfo[] | any[]) {
        return plainToClass(this, result[0], { excludeExtraneousValues: true }); 
    }


    /**
     * Creates an array of instances of the calling class from a result based on Expose annotations
     * Used for GET results which are arrays of items
     * @param result Array of results, usually from a database or API call
     */
    static getList (result: FieldInfo[] | any[]) {
        return (result as any[]).map((item: any) => this.fromResult([item]))
    }
}