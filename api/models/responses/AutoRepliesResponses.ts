import { BaseResponse } from "./BaseResponse.js";

export class AutoRepliesListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    reply_type?: string;
    pattern?: string;
    response?: string;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('reply_type', r, String);
        this.setOptional('pattern', r, String);
        this.setOptional('response', r, String);
    }
}