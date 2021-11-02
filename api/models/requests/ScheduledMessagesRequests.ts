import { Expose } from "class-transformer";
import util from "../../utils/util.js";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * scheduled_messages/add
 */
class ScheduledMessagesAddItem extends BaseRequest {
    public device_id: number;
    public to: string;
    public data: string;
    public mime_type: string;
    public timestamp: number;
    public title: string;
    public repeat: number;

    constructor(r: any) {
        super();
        this.device_id = Number(r.device_id);
        this.to = String(r.to);
        this.data = String(r.data);
        this.mime_type = String(r.mime_type);
        this.timestamp = Number(r.timestamp);
        this.title = String(r.title);
        this.repeat = Number(r.repeat);
    }


    static required = [
        ...super.required,
        'device_id',
        'to',
        'data',
        'mime_type',
        'timestamp',
        'title',
        'repeat'
    ]
}

export class ScheduledMessagesAddRequest extends HasItemsRequest {
    // Body
    public scheduled_messages: ScheduledMessagesAddItem[];

    constructor(r: any) {
        super(r);
        this.scheduled_messages = ScheduledMessagesAddRequest.createItems(r.scheduled_messages);
    }


    static itemsPropName = 'scheduled_messages';
    static itemsPropType = ScheduledMessagesAddItem;
}




/**
 * scheduled_messages/update/:device_id
 */
export class ScheduledMessagesUpdateRequest extends UpdateDeviceIdRequest {
    public to?: string;
    public data?: string;
    public mime_type?: string;
    public timestamp?: number;
    public title?: string;
    public repeat?: number;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'to') && (this.to = String(r.to));
        !util.propMissing(r, 'data') && (this.data = String(r.data));
        !util.propMissing(r, 'mime_type') && (this.mime_type = String(r.mime_type));
        !util.propMissing(r, 'timestamp') && (this.timestamp = Number(r.timestamp));
        !util.propMissing(r, 'title') && (this.title = String(r.title));
        !util.propMissing(r, 'repeat') && (this.repeat = Number(r.repeat));
    }


    static optional = ['to', 'data', 'mime_type', 'timestamp', 'title', 'repeat'];
    static atLeastOne = true;
}