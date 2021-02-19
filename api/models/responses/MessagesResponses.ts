import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class MessagesListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() device_conversation_id!: number;
    @Expose() message_type!: number;
    @Expose() data!: string;
    @Expose() timestamp!: number;
    @Expose() mime_type!: string;
    @Expose() read!: boolean;
    @Expose() seen!: boolean;
    @Expose() message_from!: string;
    @Expose() color!: number;
    @Expose() sent_device!: number;
    @Expose() sim_stamp!: string;
}
