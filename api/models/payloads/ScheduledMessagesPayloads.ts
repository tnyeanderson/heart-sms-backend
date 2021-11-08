import { BasePayload } from './BasePayload.js';

export class removed_scheduled_message extends BasePayload {
	constructor (
		public id: number
	) { super() }
}

export class added_scheduled_message extends BasePayload {
	constructor (
		public id: number,
		public to: string,
		public data: string,
		public mime_type: string,
		public timestamp: number,
		public title: string,
		public repeat: number
	) { super() }
}

export class updated_scheduled_message extends added_scheduled_message { }
