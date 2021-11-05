import { BaseResponse } from "./BaseResponse.js";

export class AutoRepliesListResponse extends BaseResponse {
	id?: number;
	account_id?: string;
	device_id?: number;
	reply_type?: string;
	pattern?: string;
	response?: string;

	constructor(r: AutoRepliesListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('account_id', r, String);
		this.setProp('device_id', r, Number);
		this.setProp('reply_type', r, String);
		this.setProp('pattern', r, String);
		this.setProp('response', r, String);
	}
}