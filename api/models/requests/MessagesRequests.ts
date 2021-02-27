import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, HasItemsRequest, LimitOffsetRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";



/**
 * messages/
 */
export class MessagesGetRequest extends LimitOffsetRequest {
    // Query
    @Expose() conversation_id: number = -1;

    static optional = ['conversation_id', ...LimitOffsetRequest.optional];
}



/**
 * messages/add
 */
class MessagesAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() device_conversation_id: number = -1;
    @Expose() message_type: number = -1;
    @Expose() data: string = '';
    @Expose() timestamp: number = -1;
    @Expose() mime_type: string = '';
    @Expose() read: boolean = false;
    @Expose() seen: boolean = false;
    @Expose() sent_device: number = -1;
    @Expose() message_from: string = '';
    @Expose() color: number = -1;
    @Expose() sim_stamp: string = '';

    static optional = ['message_from', 'color', 'sim_stamp'];
}

export class MessagesAddRequest extends HasItemsRequest {
    // Body
    messages: MessagesAddItem[] = [new MessagesAddItem];

    static itemsPropName = 'messages';
}


/**
 * messages/update/:device_id
 */
export class MessagesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() message_type: number = -1;
    @Expose() timestamp: number = -1;
    @Expose() read: boolean = false;
    @Expose() seen: boolean = false;

    static optional = ['message_type', 'timestamp', 'read', 'seen'];
    static atLeastOne = true;
}


/**
 * messages/update_type/:device_id
 */
export class MessagesUpdateTypeRequest extends UpdateDeviceIdRequest {
    // Query
    @Expose() message_type: number = -1;
}


/**
 * messages/cleanup
 */
export class MessagesCleanupRequest extends AccountIdRequest {
    // Query
    @Expose() timestamp: number = -1;
}


/**
 * messages/forward_to_phone
 */
export class MessagesForwardToPhoneRequest extends AccountIdRequest {
    // Body
    @Expose() to: string = '';
    @Expose() message: string = '';
    @Expose() mime_type: string = '';
    @Expose() message_id: number = -1
    @Expose() sent_device: number = -1

    // TODO: Write tests
    // TODO: Verify if this is correct
    static optional = ['mime_type', 'message_id'];
}