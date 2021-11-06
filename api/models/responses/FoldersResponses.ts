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

	constructor(r: FoldersListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('account_id', r, String);
		this.setProp('device_id', r, Number);
		this.setProp('name', r, String);
		this.setProp('color', r, Number);
		this.setProp('color_light', r, Number);
		this.setProp('color_dark', r, Number);
		this.setProp('color_accent', r, Number);
	}
}


