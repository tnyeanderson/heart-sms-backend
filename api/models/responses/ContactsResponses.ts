import { BaseResponse } from './BaseResponse.js';

export class ContactsBaseListResponse extends BaseResponse {
    phone_number?: string;
    name?: string;
    id?: number;
    color?: number;
    color_accent?: number;
    contact_type?: number;

    constructor(r: ContactsBaseListResponse) {
        super();
        this.setProp('phone_number', r, String);
        this.setProp('name', r, String);
        this.setProp('id', r, Number);
        this.setProp('color', r, Number);
        this.setProp('color_accent', r, Number);
        this.setProp('contact_type', r, Number);
    }
}

export class ContactsSimpleListResponse extends ContactsBaseListResponse {
    id_matcher?: string;

    constructor(r: ContactsSimpleListResponse) {
        super(r);
        this.setProp('id_matcher', r, String);
    }
}


export class ContactsListResponse extends ContactsBaseListResponse {
    account_id?: string;
    device_id?: number;
    color_dark?: number;
    color_light?: number;

    constructor(r: ContactsListResponse) {
        super(r);
        this.setProp('account_id', r, String);
        this.setProp('device_id', r, Number);
        this.setProp('color_dark', r, Number);
        this.setProp('color_light', r, Number);
    }
}