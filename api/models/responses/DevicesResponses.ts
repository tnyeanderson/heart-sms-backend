import { BaseResponse } from './BaseResponse.js';

export class DevicesListResponse extends BaseResponse {
	id?: number;
	info?: string;
	name?: string;
	primary?: boolean;
	account_id?: string;
	fcm_token?: string;
	ios?: boolean;

	constructor(r: DevicesListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('info', r, String);
		this.setProp('name', r, String);
		this.setProp('primary', r, Boolean);
		this.setProp('account_id', r, String);
		this.setProp('fcm_token', r, String);
		this.setProp('ios', r, Boolean);
	}
}

export class DevicesAddResponse extends BaseResponse {
	id?: number;

	constructor(r: DevicesAddResponse) {
		super();
		this.setProp('id', r, Number);
	}
}
