import { Expose } from "class-transformer";
import { AccountIdRequest } from "./BaseRequests.js";



/**
 * media/:message_id
 */
export class MediaGetRequest extends AccountIdRequest {
    // URL params
    public message_id: number;

    constructor(r: any) {
        super(r);
        this.message_id = Number(r.message_id);
    }


    static required = [
        ...super.required,
        'message_id'
    ]
}



/**
 * media/add
 */
export class MediaAddRequest extends AccountIdRequest {
    // Body
    public message_id: number;
    public data: string;

    constructor(r: any) {
        super(r);
        this.message_id = Number(r.message_id);
        this.data = String(r.data);
    }


    static required = [
        ...super.required,
        'message_id',
        'data'
    ]
}