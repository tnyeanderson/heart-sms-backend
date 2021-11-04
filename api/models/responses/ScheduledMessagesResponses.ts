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
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('to', r, String);
        this.setOptional('data', r, String);
        this.setOptional('mime_type', r, String);
        this.setOptional('timestamp', r, Number);
        this.setOptional('title', r, String);
        this.setOptional('repeat', r, Number);
    }
}
