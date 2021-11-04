import { BaseResponse } from './BaseResponse.js';

export class TemplatesListResponse extends BaseResponse {
    device_id?: number;
    text?: string;

    constructor(r: any) {
        super();
        this.setOptional('device_id', r, Number);
        this.setOptional('text', r, String);
    }
}
