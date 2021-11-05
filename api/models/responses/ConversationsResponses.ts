import { BaseResponse } from './BaseResponse.js';

export class ConversationsListResponse extends BaseResponse {
	id?: number;
	account_id?: string;
	device_id?: number;
	folder_id?: number;
	color?: number;
	color_dark?: number;
	color_light?: number;
	color_accent?: number;
	led_color?: number;
	pinned?: boolean;
	read?: boolean;
	timestamp?: number;
	title?: string;
	phone_numbers?: string;
	snippet?: string;
	ringtone?: string;
	image_uri?: string;
	id_matcher?: string;
	mute?: boolean;
	archive?: boolean;
	private_notifications?: boolean;

	constructor(r: ConversationsListResponse) {
		super();
		this.setProp('id', r, Number);
		this.setProp('account_id', r, String);
		this.setProp('device_id', r, Number);
		this.setProp('folder_id', r, Number);
		this.setProp('color', r, Number);
		this.setProp('color_dark', r, Number);
		this.setProp('color_light', r, Number);
		this.setProp('color_accent', r, Number);
		this.setProp('led_color', r, Number);
		this.setProp('pinned', r, Boolean);
		this.setProp('read', r, Boolean);
		this.setProp('timestamp', r, Number);
		this.setProp('title', r, String);
		this.setProp('phone_numbers', r, String);
		this.setProp('snippet', r, String);
		this.setProp('ringtone', r, String);
		this.setProp('image_uri', r, String);
		this.setProp('id_matcher', r, String);
		this.setProp('mute', r, Boolean);
		this.setProp('archive', r, Boolean);
		this.setProp('private_notifications', r, Boolean);
	}
}

