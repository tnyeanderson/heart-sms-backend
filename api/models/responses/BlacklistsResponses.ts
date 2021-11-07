import { BaseResponse } from "./BaseResponse.js";

export class BlacklistListResponse extends BaseResponse {
	id?: number;
	account_id?: string;
	device_id?: number;
	phone_number?: string;
	phrase?: string;

	constructor(r: BlacklistListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('account_id', r, String);
		this.setProp('device_id', r, Number);
		this.setProp('phone_number', r, String);
		this.setProp('phrase', r, String);
	}
}
