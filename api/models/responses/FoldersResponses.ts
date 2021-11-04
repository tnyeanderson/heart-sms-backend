import { BaseResponse } from './BaseResponse.js';

export class FoldersListResponse extends BaseResponse {
    id?: number;
    account_id?: string;
    device_id?: number;
    name?: string;
    color?: number;
    color_light?: number;
    color_dark?: number;
    color_accent?: number;

    constructor(r: any) {
        super();
        this.setOptional('id', r, Number);
        this.setOptional('account_id', r, String);
        this.setOptional('device_id', r, Number);
        this.setOptional('name', r, String);
        this.setOptional('color', r, Number);
        this.setOptional('color_light', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_accent', r, Number);
    }
}


