import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class ContactsBaseListResponse extends BaseResponse {
    @Expose() phone_number!: string;
    @Expose() name!: string;
    @Expose() id!: number;
    @Expose() color!: number;
    @Expose() color_accent!: number;
    @Expose() contact_type!: number;
}

export class ContactsSimpleListResponse extends ContactsBaseListResponse {
    @Expose() id_matcher!: string;
}


export class ContactsListResponse extends ContactsBaseListResponse {
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() color_dark!: number;
    @Expose() color_light!: number;
}