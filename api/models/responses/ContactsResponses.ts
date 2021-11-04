import { BaseResponse } from './BaseResponse.js';

export class ContactsBaseListResponse extends BaseResponse {
    phone_number?: string;
    name?: string;
    id?: number;
    color?: number;
    color_accent?: number;
    contact_type?: number;

    constructor(r: any) {
        super();
        this.setOptional('phone_number', r, String);
        this.setOptional('name', r, String);
        this.setOptional('id', r, Number);
        this.setOptional('color', r, Number);
        this.setOptional('color_accent', r, Number);
        this.setOptional('contact_type', r, Number);
    }
}

export class ContactsSimpleListResponse extends ContactsBaseListResponse {
    id_matcher?: string;

    constructor(r: any) {
        super(r);
        this.setOptional('id_matcher', r, String);
    }
}


export class ContactsListResponse extends ContactsBaseListResponse {
    account_id?: string;
    device_id?: number;
    color_dark?: number;
    color_light?: number;

    constructor(r: any) {
        super(r);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_light', r, Number);
    }
}