import { BaseResponse } from './BaseResponse.js';

export class SignupResponse extends BaseResponse {
    account_id?: string;
    salt1?: string;
    salt2?: string;

    constructor(r: any) {
        super();
        this.setOptional('account_id', r, String);
        this.setOptional('salt1', r, String);
        this.setOptional('salt2', r, String);
    }
}


export class CountResponse extends BaseResponse {
    device_count?: number;
    message_count?: number;
    conversation_count?: number;
    draft_count?: number;
    scheduled_count?: number;
    blacklist_count?: number;
    contact_count?: number;
    template_count?: number;
    folder_count?: number;
    auto_reply_count?: number;

    constructor(r: any) {
        super();
        this.setOptional('device_count', r, Number);
        this.setOptional('message_count', r, Number);
        this.setOptional('conversation_count', r, Number);
        this.setOptional('draft_count', r, Number);
        this.setOptional('scheduled_count', r, Number);
        this.setOptional('blacklist_count', r, Number);
        this.setOptional('contact_count', r, Number);
        this.setOptional('template_count', r, Number);
        this.setOptional('folder_count', r, Number);
        this.setOptional('auto_reply_count', r, Number);

    }
}


export class SettingsResponse extends BaseResponse {
    base_theme?: string;
    global_color_theme?: string;
    rounder_bubbles?: boolean;
    color?: number;
    color_dark?: number;
    color_light?: number;
    color_accent?: number;
    use_global_theme?: boolean;
    apply_primary_color_toolbar?: boolean;
    passcode?: string;
    subscription_type?: number;
    message_timestamp?: boolean;
    conversation_categories?: boolean;

    constructor(r: any) {
        super();
        this.setOptional('base_theme', r, String);
        this.setOptional('global_color_theme', r, String);
        this.setOptional('rounder_bubbles', r, Boolean);
        this.setOptional('color', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_light', r, Number);
        this.setOptional('color_accent', r, Number);
        this.setOptional('use_global_theme', r, Boolean);
        this.setOptional('apply_primary_color_toolbar', r, Boolean);
        this.setOptional('passcode', r, String);
        this.setOptional('subscription_type', r, Number);
        this.setOptional('message_timestamp', r, Boolean);
        this.setOptional('conversation_categories', r, Boolean);
    }
}


export class LoginResponse extends BaseResponse {
    account_id?: string;
    salt1?: string;
    salt2?: string;
    phone_number?: string;
    name?: string;
    subscription_type?: number;
    subscription_expiration?: number;
    base_theme?: string;
    rounder_bubbles?: boolean;
    global_color_theme?: string;
    color?: number;
    color_dark?: number;
    color_light?: number;
    color_accent?: number;
    use_global_theme?: boolean;
    apply_primary_color_toolbar?: boolean;
    passcode?: string;
    message_timestamp?: boolean;
    conversation_categories?: boolean;

    constructor(r: any) {
        super();
        this.setOptional('account_id', r, String);
        this.setOptional('salt1', r, String);
        this.setOptional('salt2', r, String);
        this.setOptional('phone_number', r, String);
        this.setOptional('name', r, String);
        this.setOptional('subscription_type', r, Number);
        this.setOptional('subscription_expiration', r, Number);
        this.setOptional('base_theme', r, String);
        this.setOptional('rounder_bubbles', r, Boolean);
        this.setOptional('global_color_theme', r, String);
        this.setOptional('color', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_light', r, Number);
        this.setOptional('color_accent', r, Number);
        this.setOptional('use_global_theme', r, Boolean);
        this.setOptional('apply_primary_color_toolbar', r, Boolean);
        this.setOptional('passcode', r, String);
        this.setOptional('message_timestamp', r, Boolean);
        this.setOptional('conversation_categories', r, Boolean);
    }
}