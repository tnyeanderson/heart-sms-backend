import { Expose } from "class-transformer";
import util from "../../utils/util.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, LimitOffsetRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";



/**
 * messages/
 */
export class MessagesGetRequest extends LimitOffsetRequest {
    // Query
    public conversation_id: number;

    constructor(r: any) {
        super(r);
        this.conversation_id = Number(r.conversation_id); 
    }


    static required = [
        ...super.required,
        'conversation_id'
    ]

    static optional = ['conversation_id', ...LimitOffsetRequest.optional];
}



/**
 * messages/add
 */
class MessagesAddItem extends BaseRequest {
    public device_id: number;
    public device_conversation_id: number;
    public message_type: number;
    public data: string;
    public timestamp: number;
    public mime_type: string;
    public read: boolean;
    public seen: boolean;
    public sent_device: number;
    public message_from?: string;
    public color?: number;
    public sim_stamp?: string;

    constructor(r: any) {
        super();
        this.device_id = Number(r.device_id);
        this.device_conversation_id = Number(r.device_conversation_id);
        this.message_type = Number(r.message_type);
        this.data = String(r.data);
        this.timestamp = Number(r.timestamp);
        this.mime_type = String(r.mime_type);
        this.read = Boolean(r.read);
        this.seen = Boolean(r.seen);
        this.sent_device = Number(r.sent_device);
        !util.propMissing(r, 'message_from') && (this.message_from = String(r.message_from));
        !util.propMissing(r, 'color') && (this.color = Number(r.color));
        !util.propMissing(r, 'sim_stamp') && (this.sim_stamp = String(r.sim_stamp));
    }


    static required = [
        ...super.required,
        'device_id',
        'device_conversation_id',
        'message_type',
        'data',
        'timestamp',
        'mime_type',
        'read',
        'seen',
        'sent_device'
    ]

    static optional = ['message_from', 'color', 'sim_stamp'];
}

export class MessagesAddRequest extends HasItemsRequest {
    // Body
    messages: MessagesAddItem[];

    constructor(r: any) {
        super(r)
        this.messages = MessagesAddRequest.createItems(r.messages);
    }


    static itemsPropName = 'messages';
    static itemsPropType = MessagesAddItem;
}


/**
 * messages/update/:device_id
 */
export class MessagesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public message_type?: number;
    public timestamp?: number;
    public read?: boolean;
    public seen?: boolean;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'message_type') && (this.message_type = Number(r.message_type));
        !util.propMissing(r, 'timestamp') && (this.timestamp = Number(r.timestamp));
        !util.propMissing(r, 'read') && (this.read = Boolean(r.read));
        !util.propMissing(r, 'seen') && (this.seen = Boolean(r.seen));
    }


    static optional = ['message_type', 'timestamp', 'read', 'seen'];
    static atLeastOne = true;
}


/**
 * messages/update_type/:device_id
 */
export class MessagesUpdateTypeRequest extends UpdateDeviceIdRequest {
    // Query
    public message_type: number;

    constructor(r: any) {
        super(r);
        this.message_type = Number(r.message_type); 
    }


    static required = [
        ...super.required,
        'message_type'
    ]
}


/**
 * messages/cleanup
 */
export class MessagesCleanupRequest extends AccountIdRequest {
    // Query
    public timestamp: number;

    constructor(r: any) {
        super(r);
        this.timestamp = Number(r.timestamp); 
    }


    static required = [
        ...super.required,
        'timestamp'
    ]
}


/**
 * messages/forward_to_phone
 */
export class MessagesForwardToPhoneRequest extends AccountIdRequest {
    // Body
    public to: string;
    public message: string;
    public sent_device: number;
    public mime_type?: string;
    public message_id?: number;

    constructor(r: any) {
        super(r);
        this.to = String(r.to);
        this.message = String(r.message);
        this.sent_device = Number(r.sent_device);
        !util.propMissing(r, 'mime_type') && (this.mime_type = String(r.mime_type));
        !util.propMissing(r, 'message_id') && (this.message_id = Number(r.message_id));
    }


    static required = [
        ...super.required,
        'to',
        'message',
        'sent_device'
    ]

    // TODO: Write tests
    // TODO: Verify if this is correct
    static optional = ['mime_type', 'message_id'];
}