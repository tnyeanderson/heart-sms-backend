import { Required } from "../../utils/decorators.js";
import { AccountIdRequest } from "./BaseRequests.js";



/**
 * media/:message_id
 */
export class MediaGetRequest extends AccountIdRequest {
    // URL params
    @Required message_id: number;

    constructor(r: any) {
        super(r);
        this.message_id = Number(r.message_id);
    }
}



/**
 * media/add
 */
export class MediaAddRequest extends AccountIdRequest {
    // Body
    @Required message_id: number;
    @Required data: string;

    constructor(r: any) {
        super(r);
        this.message_id = Number(r.message_id);
        this.data = String(r.data);
    }
}