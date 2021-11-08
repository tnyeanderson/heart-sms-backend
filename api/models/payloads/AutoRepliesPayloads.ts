import { BasePayload } from './BasePayload.js';

export class removed_auto_reply extends BasePayload {
	constructor (
		public id: number
	) { super() }
}

export class added_auto_reply extends BasePayload {
	constructor (
		public device_id: number,
		public type: string,
		public pattern: string,
		public response: string
	) { super() }
}

export class updated_auto_reply extends added_auto_reply {}
