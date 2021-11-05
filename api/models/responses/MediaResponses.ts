import { BaseResponse } from './BaseResponse.js';

export class MediaGetResponse extends BaseResponse {
	data?: string;

	constructor(r: MediaGetResponse) {
		super();
		this.setProp('data', r, String);
	}
}
