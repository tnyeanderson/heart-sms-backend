import { Expose } from "class-transformer";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * auto_replies/update/:device_id
 */
export class AutoRepliesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public reply_type: string;
    public pattern: string;
    public response: string;

    constructor(r: any) {
        super(r);
        this.reply_type = String(r.reply_type);
        this.pattern = String(r.pattern);
        this.response = String(r.response);
    }


    static required = [
        ...super.required,
        'reply_type',
        'pattern',
        'response'
    ]
}



/**
 * auto_replies/add
 */
class AutoRepliesAddItem extends AutoRepliesUpdateRequest {
    public device_id: number;

    constructor(r: any) {
        super(r);
        this.device_id = Number(r.device_id);
    }


    static required = [
        ...super.required,
        'device_id'
    ]
}

export class AutoRepliesAddRequest extends HasItemsRequest {
    // Body
    public auto_replies: AutoRepliesAddItem[];

    constructor(r: any) {
        super(r);
        this.auto_replies = AutoRepliesAddRequest.createItems(r.auto_replies);
    }


    static itemsPropName = 'auto_replies';
    static itemsPropType = AutoRepliesAddItem;
}