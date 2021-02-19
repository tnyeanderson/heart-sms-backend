import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class ConversationsListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() folder_id!: number;
    @Expose() color!: number;
    @Expose() color_dark!: number;
    @Expose() color_light!: number;
    @Expose() color_accent!: number;
    @Expose() led_color!: number;
    @Expose() pinned!: boolean;
    @Expose() read!: boolean;
    @Expose() timestamp!: number;
    @Expose() title!: string;
    @Expose() phone_numbers!: string;
    @Expose() snippet!: string;
    @Expose() ringtone!: string;
    @Expose() image_uri!: string;
    @Expose() id_matcher!: string;
    @Expose() mute!: boolean;
    @Expose() archive!: boolean;
    @Expose() private_notifications!: boolean;
}

