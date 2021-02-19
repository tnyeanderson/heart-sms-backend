import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class DevicesListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() info!: string;
    @Expose() name!: string;
    @Expose() primary!: boolean;
    @Expose() account_id!: string;
    @Expose() fcm_token!: string;
    @Expose() ios!: boolean
}