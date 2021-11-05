import { BaseResponse } from './BaseResponse.js';

export class TemplatesListResponse extends BaseResponse {
    device_id?: number;
    text?: string;

    constructor(r: TemplatesListResponse) {
        super();
        this.setProp('device_id', r, Number);
        this.setProp('text', r, String);
    }
}
