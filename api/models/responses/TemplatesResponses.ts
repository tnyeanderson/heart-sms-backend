import { Expose } from 'class-transformer';
import { BaseResponse } from './BaseResponse.js';

export class TemplatesListResponse extends BaseResponse {
    @Expose() device_id!: number;
    @Expose() text!: string;
}
