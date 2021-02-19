import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class DraftsListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() device_conversation_id!: number;
    @Expose() data!: string;
    @Expose() mime_type!: string
}




