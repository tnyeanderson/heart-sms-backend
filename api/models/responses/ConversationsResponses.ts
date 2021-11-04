import { BaseResponse } from './BaseResponse.js';

export class ConversationsListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    folder_id?: number;
    color?: number;
    color_dark?: number;
    color_light?: number;
    color_accent?: number;
    led_color?: number;
    pinned?: boolean;
    read?: boolean;
    timestamp?: number;
    title?: string;
    phone_numbers?: string;
    snippet?: string;
    ringtone?: string;
    image_uri?: string;
    id_matcher?: string;
    mute?: boolean;
    archive?: boolean;
    private_notifications?: boolean;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('folder_id', r, Number);
        this.setOptional('color', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_light', r, Number);
        this.setOptional('color_accent', r, Number);
        this.setOptional('led_color', r, Number);
        this.setOptional('pinned', r, Boolean);
        this.setOptional('read', r, Boolean);
        this.setOptional('timestamp', r, Number);
        this.setOptional('title', r, String);
        this.setOptional('phone_numbers', r, String);
        this.setOptional('snippet', r, String);
        this.setOptional('ringtone', r, String);
        this.setOptional('image_uri', r, String);
        this.setOptional('id_matcher', r, String);
        this.setOptional('mute', r, Boolean);
        this.setOptional('archive', r, Boolean);
        this.setOptional('private_notifications', r, Boolean);
    }
}

