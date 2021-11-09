import { DismissedNotificationRequest, UpdateSettingRequest } from '../requests/AccountsRequests.js';
import { AccountIdRequest } from '../requests/BaseRequests.js';
import { BasePayload } from './BasePayload.js';

export class dismissed_notification extends BasePayload {
	id: string;
	device_id?: string;

	constructor (r: DismissedNotificationRequest) {
		super();
		this.id = String(r.id);
		this.setProp('device_id', r, String);
	}
}

export class cleaned_account extends BasePayload {
	id: string

	constructor (r: AccountIdRequest) {
		super();
		this.id = String(r.account_id);
	}
}

export class update_setting extends BasePayload {
	pref: string;
	type: string;
	value: unknown;

	constructor(r: UpdateSettingRequest) {
		super();
		this.pref = String(r.pref);
		this.type = String(r.type);
		this.value = r.value;
	}
}

export class removed_account extends cleaned_account {}
