import { BaseResponse } from './BaseResponse.js';

export class DevicesListResponse extends BaseResponse {
    id?: number;
    info?: string;
    name?: string;
    primary?: boolean;
    account_id?: string;
    fcm_token?: string;
    ios?: boolean;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('info', r, String);
        this.setOptional('name', r, String);
        this.setOptional('primary', r, Boolean);
        this.setOptional('account_id', r, String);
        this.setOptional('fcm_token', r, String);
        this.setOptional('ios', r, Boolean);
    }
}


export class DevicesAddResponse extends BaseResponse {
    id?: number;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
    }
}