import { BaseResponse } from './BaseResponse.js';

export class DraftsListResponse extends BaseResponse {
	id?: number;
	account_id?: string;
	device_id?: number;
	device_conversation_id?: number;
	data?: string;
	mime_type?: string;

	constructor(r: DraftsListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('account_id', r, String);
		this.setProp('device_id', r, Number);
		this.setProp('device_conversation_id', r, Number);
		this.setProp('data', r, String);
		this.setProp('mime_type', r, String);
	}
}




