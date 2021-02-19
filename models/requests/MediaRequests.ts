import { Expose } from "class-transformer";
import { AccountIdRequest } from "./BaseRequests.js";



/**
 * media/:message_id
 */
export class MediaGetRequest extends AccountIdRequest {
    // URL params
    @Expose() message_id: string = '';
}



/**
 * media/add
 */
export class MediaAddRequest extends AccountIdRequest {
    // Body
    @Expose() message_id: number = -1;
    @Expose() data: string = '';
}