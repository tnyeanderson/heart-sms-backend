import { BasePayload } from './BasePayload.js';

export class added_contact extends BasePayload {
	constructor (
		public phone_number: string,
		public name: string,
		public color: number,
		public color_dark: number,
		public color_light: number,
		public color_accent: number,
		public type: number
	) { super() }
}

export class updated_contact extends BasePayload {
	constructor (
		public device_id: number,
		public phone_number: string,
		public name: string,
		public color: number,
		public color_dark: number,
		public color_light: number,
		public color_accent: number,
		public type: number
	) { super() }
}

export class removed_contact extends BasePayload {
	constructor (
		public device_id: number,
		public phone_number: string
	) { super() }
}

export class removed_contact_by_id extends BasePayload {
	constructor (
		public id: string
	) { super() }
}
