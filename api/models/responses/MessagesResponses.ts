import { BaseResponse } from './BaseResponse.js';

export class MessagesListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    device_conversation_id?: number;
    message_type?: number;
    data?: string;
    timestamp?: number;
    mime_type?: string;
    read?: boolean;
    seen?: boolean;
    message_from?: string;
    color?: number;
    sent_device?: number;
    sim_stamp?: string;

    constructor(r: any) {
        super();
        this.setProp('id', r, Number);
        this.setProp('account_id', r, String);
        this.setProp('device_id', r, Number);
        this.setProp('device_conversation_id', r, Number);
        this.setProp('message_type', r, Number);
        this.setProp('data', r, String);
        this.setProp('timestamp', r, Number);
        this.setProp('mime_type', r, String);
        this.setProp('read', r, Boolean);
        this.setProp('seen', r, Boolean);
        this.setProp('message_from', r, String);
        this.setProp('color', r, Number);
        this.setProp('sent_device', r, Number);
        this.setProp('sim_stamp', r, String);
    }
}
