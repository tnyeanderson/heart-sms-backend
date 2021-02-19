import { Expose } from "class-transformer";
import { BaseResponse } from "./BaseResponse.js";

export class AutoRepliesListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() reply_type!: string;
    @Expose() pattern!: string;
    @Expose() response!: string;
}