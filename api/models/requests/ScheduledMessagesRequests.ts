import { Expose } from "class-transformer";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * scheduled_messages/add
 */
class ScheduledMessagesAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() to: string = '';
    @Expose() data: string = '';
    @Expose() mime_type: string = '';
    @Expose() timestamp: number = -1;
    @Expose() title: string = '';
    @Expose() repeat: number = -1;
}

export class ScheduledMessagesAddRequest extends HasItemsRequest {
    // Body
    scheduled_messages: ScheduledMessagesAddItem[] = [new ScheduledMessagesAddItem];

    static itemsPropName = 'scheduled_messages';
}




/**
 * scheduled_messages/update/:device_id
 */
export class ScheduledMessagesUpdateRequest extends UpdateDeviceIdRequest {
    @Expose() to: string = '';
    @Expose() data: string = '';
    @Expose() mime_type: string = '';
    @Expose() timestamp: number = -1;
    @Expose() title: string = '';
    @Expose() repeat: number = -1;

    static optional = ['to', 'data', 'mime_type', 'timestamp', 'title', 'repeat'];
    static atLeastOne = true;
}