import { BaseResponse } from './BaseResponse.js';

export class DraftsListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    device_conversation_id?: number;
    data?: string;
    mime_type?: string;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('device_conversation_id', r, Number);
        this.setOptional('data', r, String);
        this.setOptional('mime_type', r, String);
    }
}




