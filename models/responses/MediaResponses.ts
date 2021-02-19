import { BaseResponse } from './BaseResponse.js';

export class MediaGetResponse extends BaseResponse {
    constructor(
        public data: string
    ) { super() }
}
