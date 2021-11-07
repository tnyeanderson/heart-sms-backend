import { BaseResponse } from './BaseResponse.js';

export class SignupResponse extends BaseResponse {
	account_id?: string;
	salt1?: string;
	salt2?: string;

	constructor(r: SignupResponse) {
		super();
		this.setProp('account_id', r, String);
		this.setProp('salt1', r, String);
		this.setProp('salt2', r, String);
	}
}

export class CountResponse extends BaseResponse {
	device_count?: number;
	message_count?: number;
	conversation_count?: number;
	draft_count?: number;
	scheduled_count?: number;
	blacklist_count?: number;
	contact_count?: number;
	template_count?: number;
	folder_count?: number;
	auto_reply_count?: number;

	constructor(r: CountResponse) {
		super();
		this.setProp('device_count', r, Number);
		this.setProp('message_count', r, Number);
		this.setProp('conversation_count', r, Number);
		this.setProp('draft_count', r, Number);
		this.setProp('scheduled_count', r, Number);
		this.setProp('blacklist_count', r, Number);
		this.setProp('contact_count', r, Number);
		this.setProp('template_count', r, Number);
		this.setProp('folder_count', r, Number);
		this.setProp('auto_reply_count', r, Number);

	}
}

export class SettingsResponse extends BaseResponse {
	base_theme?: string;
	global_color_theme?: string;
	rounder_bubbles?: boolean;
	color?: number;
	color_dark?: number;
	color_light?: number;
	color_accent?: number;
	use_global_theme?: boolean;
	apply_primary_color_toolbar?: boolean;
	passcode?: string;
	subscription_type?: number;
	message_timestamp?: boolean;
	conversation_categories?: boolean;

	constructor(r: SettingsResponse) {
		super();
		this.setProp('base_theme', r, String);
		this.setProp('global_color_theme', r, String);
		this.setProp('rounder_bubbles', r, Boolean);
		this.setProp('color', r, Number);
		this.setProp('color_dark', r, Number);
		this.setProp('color_light', r, Number);
		this.setProp('color_accent', r, Number);
		this.setProp('use_global_theme', r, Boolean);
		this.setProp('apply_primary_color_toolbar', r, Boolean);
		this.setProp('passcode', r, String);
		this.setProp('subscription_type', r, Number);
		this.setProp('message_timestamp', r, Boolean);
		this.setProp('conversation_categories', r, Boolean);
	}
}

export class LoginResponse extends BaseResponse {
	account_id?: string;
	salt1?: string;
	salt2?: string;
	phone_number?: string;
	name?: string;
	subscription_type?: number;
	subscription_expiration?: number;
	base_theme?: string;
	rounder_bubbles?: boolean;
	global_color_theme?: string;
	color?: number;
	color_dark?: number;
	color_light?: number;
	color_accent?: number;
	use_global_theme?: boolean;
	apply_primary_color_toolbar?: boolean;
	passcode?: string;
	message_timestamp?: boolean;
	conversation_categories?: boolean;

	constructor(r: LoginResponse) {
		super();
		this.setProp({target: 'account_id', source: 'session_id'}, r, String);
		this.setProp('salt1', r, String);
		this.setProp('salt2', r, String);
		this.setProp('phone_number', r, String);
		this.setProp('name', r, String);
		this.setProp('subscription_type', r, Number);
		this.setProp('subscription_expiration', r, Number);
		this.setProp('base_theme', r, String);
		this.setProp('rounder_bubbles', r, Boolean);
		this.setProp('global_color_theme', r, String);
		this.setProp('color', r, Number);
		this.setProp('color_dark', r, Number);
		this.setProp('color_light', r, Number);
		this.setProp('color_accent', r, Number);
		this.setProp('use_global_theme', r, Boolean);
		this.setProp('apply_primary_color_toolbar', r, Boolean);
		this.setProp('passcode', r, String);
		this.setProp('message_timestamp', r, Boolean);
		this.setProp('conversation_categories', r, Boolean);
	}
}
