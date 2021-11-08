import { BasePayload } from './BasePayload.js';

export class added_message extends BasePayload {
	constructor (
		public id: number,
		public conversation_id: number,
		public type: number,
		public data: string,
		public timestamp: number,
		public mime_type: string,
		public read: boolean,
		public seen: boolean,
		public from: string,
		public color: number,
		public sent_device: number,
		public sim_stamp: number
	) { super() }
}

export class updated_message extends BasePayload {
	constructor (
		public id: number,
		public type: number,
		public timestamp: number,
		public read?: boolean,
		public seen?: boolean,
	) { super() }
}

export class update_message_type extends BasePayload {
	constructor (
		public id: string,
		public message_type: string
	) { super() }
}

export class removed_message extends BasePayload {
	constructor (
		public id: number
	) { super() }
}

export class cleanup_messages extends BasePayload {
	constructor (
		public timestamp: number
	) { super() }
}

export class forward_to_phone extends BasePayload {
	constructor (
		public to: string,
		public message: string,
		public sent_device: number,
		public mime_type?: string,
		public message_id?: number
	) { super() }
}
