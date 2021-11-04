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
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('device_conversation_id', r, Number);
        this.setOptional('message_type', r, Number);
        this.setOptional('data', r, String);
        this.setOptional('timestamp', r, Number);
        this.setOptional('mime_type', r, String);
        this.setOptional('read', r, Boolean);
        this.setOptional('seen', r, Boolean);
        this.setOptional('message_from', r, String);
        this.setOptional('color', r, Number);
        this.setOptional('sent_device', r, Number);
        this.setOptional('sim_stamp', r, String);
    }
}
