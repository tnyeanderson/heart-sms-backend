import { AtLeastOne, ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, LimitOffsetRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";



/**
 * messages/
 */
export class MessagesGetRequest extends LimitOffsetRequest {
    // Query
    @Optional conversation_id: number;

    constructor(r: any) {
        super(r);
        this.conversation_id = Number(r.conversation_id); 
    }
}



/**
 * messages/add
 */
class MessagesAddItem extends BaseRequest {
    @Required device_id: number;
    @Required device_conversation_id: number;
    @Required message_type: number;
    @Required data: string;
    @Required timestamp: number;
    @Required mime_type: string;
    @Required read: boolean;
    @Required seen: boolean;
    @Required sent_device: number;
    @Optional message_from?: string;
    @Optional color?: number;
    @Optional sim_stamp?: string;

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
        this.setOptional('message_from', r, String);
        this.setOptional('color', r, Number);
        this.setOptional('sim_stamp', r, String);
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
    @ItemsProp messages: MessagesAddItem[];

    constructor(r: any) {
        super(r)
        this.messages = MessagesAddRequest.createItems(r.messages);
    }

    static itemsPropType = MessagesAddItem;
}


/**
 * messages/update/:device_id
 */
@AtLeastOne
export class MessagesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Optional message_type?: number;
    @Optional timestamp?: number;
    @Optional read?: boolean;
    @Optional seen?: boolean;

    constructor(r: any) {
        super(r);
        this.setOptional('message_type', r, Number);
        this.setOptional('timestamp', r, Number);
        this.setOptional('read', r, Boolean);
        this.setOptional('seen', r, Boolean);
    }
}


/**
 * messages/update_type/:device_id
 */
export class MessagesUpdateTypeRequest extends UpdateDeviceIdRequest {
    // Query
    @Required message_type: number;

    constructor(r: any) {
        super(r);
        this.message_type = Number(r.message_type); 
    }
}


/**
 * messages/cleanup
 */
export class MessagesCleanupRequest extends AccountIdRequest {
    // Query
    @Required timestamp: number;

    constructor(r: any) {
        super(r);
        this.timestamp = Number(r.timestamp); 
    }
}


/**
 * messages/forward_to_phone
 */
export class MessagesForwardToPhoneRequest extends AccountIdRequest {
    // Body
    @Required to: string;
    @Required message: string;
    @Required sent_device: number;

    // TODO: Write tests
    // TODO: Verify if this is correct
    @Optional mime_type?: string;
    @Optional message_id?: number;

    constructor(r: any) {
        super(r);
        this.to = String(r.to);
        this.message = String(r.message);
        this.sent_device = Number(r.sent_device);
        this.setOptional('mime_type', r, String);
        this.setOptional('message_id', r, Number);
    }
}