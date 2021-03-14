import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class SignupResponse extends BaseResponse {
    constructor(
        public account_id: string,
        public salt1: string,
        public salt2: string
    ) { super() }
}


export class CountResponse extends BaseResponse {
    @Expose() device_count!: number;
    @Expose() message_count!: number;
    @Expose() conversation_count!: number;
    @Expose() draft_count!: number;
    @Expose() scheduled_count!: number;
    @Expose() blacklist_count!: number;
    @Expose() contact_count!: number;
    @Expose() template_count!: number;
    @Expose() folder_count!: number;
    @Expose() auto_reply_count!: number;
}


export class SettingsResponse extends BaseResponse {
    @Expose() base_theme!: string;
    @Expose() global_color_theme!: string;
    @Expose() rounder_bubbles!: boolean;
    @Expose() color!: number;
    @Expose() color_dark!: number;
    @Expose() color_light!: number;
    @Expose() color_accent!: number;
    @Expose() use_global_theme!: boolean;
    @Expose() apply_primary_color_toolbar!: boolean;
    @Expose() passcode!: string;
    @Expose() subscription_type!: number;
    @Expose() message_timestamp!: boolean;
    @Expose() conversation_categories!: boolean;
}


export class LoginResponse extends BaseResponse {
    @Expose({ name: 'session_id' }) account_id!: string;
    @Expose() salt1!: string;
    @Expose() salt2!: string;
    @Expose() phone_number!: string;
    @Expose() name!: string;
    @Expose() subscription_type!: number;
    @Expose() subscription_expiration!: number;
    @Expose() base_theme!: string;
    @Expose() rounder_bubbles!: boolean;
    @Expose() global_color_theme!: string;
    @Expose() color!: number;
    @Expose() color_dark!: number;
    @Expose() color_light!: number;
    @Expose() color_accent!: number;
    @Expose() use_global_theme!: boolean;
    @Expose() apply_primary_color_toolbar!: boolean;
    @Expose() passcode!: string;
    @Expose() message_timestamp!: boolean;
    @Expose() conversation_categories!: boolean;
}