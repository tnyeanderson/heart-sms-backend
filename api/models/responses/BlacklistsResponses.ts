import { Expose } from "class-transformer";
import { BaseResponse } from "./BaseResponse.js";

export class BlacklistListResponse extends BaseResponse {
    @Expose() id!: number;
    @Expose() account_id!: string;
    @Expose() device_id!: number;
    @Expose() phone_number!: string;
    @Expose() phrase!: string;
}