import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class ScheduledMessagesListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() to!: string;
    @Expose() data!: string;
    @Expose() mime_type!: string;
    @Expose() timestamp!: number;
    @Expose() title!: string;
    @Expose() repeat!: number
}
