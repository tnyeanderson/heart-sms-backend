import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";
import { Request } from 'express';


/**
 * auto_replies/update/:device_id
 */
export class AutoRepliesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() reply_type: string = '';
    @Expose() pattern: string = '';
    @Expose() response: string = '';
}



/**
 * auto_replies/add
 */
class AutoRepliesAddItem extends BaseRequest {
    // Body
    @Expose() reply_type: string = '';
    @Expose() pattern: string = '';
    @Expose() response: string = '';
    @Expose() device_id: number = -1;
}

export class AutoRepliesAddRequest extends HasItemsRequest {
    // Body
    auto_replies: AutoRepliesAddItem[] = [new AutoRepliesAddItem];


    static itemsPropName = 'auto_replies';
}