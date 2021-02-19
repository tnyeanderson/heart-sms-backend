import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class FoldersListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() name!: string;
    @Expose() color!: number;
    @Expose() color_light!: number;
    @Expose() color_dark!: number;
    @Expose() color_accent!: number;
}


