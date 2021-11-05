import { BaseResponse } from './BaseResponse.js';

export class ScheduledMessagesListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    to?: string;
    data?: string;
    mime_type?: string;
    timestamp?: number;
    title?: string;
    repeat?: number;

    constructor(r: any) {
        super();
        this.setProp('id', r, Number);
        this.setProp('account_id', r, String);
        this.setProp('device_id', r, Number);
        this.setProp('to', r, String);
        this.setProp('data', r, String);
        this.setProp('mime_type', r, String);
        this.setProp('timestamp', r, Number);
        this.setProp('title', r, String);
        this.setProp('repeat', r, Number);
    }
}
