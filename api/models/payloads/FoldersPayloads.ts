import { BasePayload } from './BasePayload.js';

export class added_folder extends BasePayload {
	constructor (
        public device_id: number,
        public name: string,
        public color: number,
        public color_dark: number,
        public color_light: number,
        public color_accent: number
	) { super() }
}

export class removed_folder extends BasePayload {
	constructor (
        public id: number
	) { super() }
}

export class updated_folder extends added_folder { }
