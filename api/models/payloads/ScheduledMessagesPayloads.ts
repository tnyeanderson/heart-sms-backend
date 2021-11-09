import { QueryResultRow } from 'pg';
import { ScheduledMessagesAddItem } from '../requests/ScheduledMessagesRequests.js';
import { DeviceIdPayload } from './BasePayload.js';

export class removed_scheduled_message extends DeviceIdPayload { }

export class added_scheduled_message extends DeviceIdPayload {
	to: string;
	data: string;
	mime_type: string;
	timestamp: number;
	title: string;
	repeat: number;

	constructor(r: ScheduledMessagesAddItem | QueryResultRow) {
		super(r);
		this.to = String(r.to);
		this.data = String(r.data);
		this.mime_type = String(r.mime_type);
		this.timestamp = Number(r.timestamp);
		this.title = String(r.title);
		this.repeat = Number(r.repeat);
	}
}

export class updated_scheduled_message extends added_scheduled_message {
	constructor(r: QueryResultRow) {
		super(r);
		// Gets passed in as id, not device_id
		this.id = Number(r.id);
	}
}
