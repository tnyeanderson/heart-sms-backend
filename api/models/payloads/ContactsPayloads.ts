import { QueryResultRow } from 'pg';
import { util } from '../../utils/util.js';
import { ContactsAddItem, ContactsRemoveDeviceIdRequest, ContactsRemoveIdsRequest } from '../requests/ContactsRequests.js';
import { BasePayload } from './BasePayload.js';

export class added_contact extends BasePayload {
	phone_number: string;
	name: string;
	color: number;
	color_dark: number;
	color_light: number;
	color_accent: number;
	type: number;

	constructor(r: ContactsAddItem | QueryResultRow) {
		super();
		this.phone_number = util.smartToString(r.phone_number);
		this.name = util.smartToString(r.name);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
		this.type = Number(r.contact_type);
	}
}

export class updated_contact extends added_contact {
	device_id: number;

	constructor(r: QueryResultRow) {
		super(r);
		this.device_id = Number(r.device_id);

		// added_contact uses device_type. Override here
		this.type = Number(r.type);
	}
}

export class removed_contact extends BasePayload {
	device_id: number;
	phone_number: string;

	constructor(r: ContactsRemoveDeviceIdRequest) {
		super();
		this.device_id = r.device_id;
		this.phone_number = r.phone_number;
	}
}

export class removed_contact_by_id extends BasePayload {
	id: string;

	constructor(r: ContactsRemoveIdsRequest) {
		super();
		this.id = r.ids;
	}
}
