import { BaseResponse } from "./BaseResponse.js";

export class BlacklistListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    phone_number?: string;
    phrase?: string;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('phone_number', r, String);
        this.setOptional('phrase', r, String);
    }
}