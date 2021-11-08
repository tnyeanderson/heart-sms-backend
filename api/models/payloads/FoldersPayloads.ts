import { FoldersAddItem } from '../requests/FoldersRequests.js';
import { BasePayload, DeviceIdPayload } from './BasePayload.js';

export class added_folder extends BasePayload {
	device_id: number;
	name: string;
	color: number;
	color_dark: number;
	color_light: number;
	color_accent: number;

	constructor(r: FoldersAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.name = String(r.name);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
	}
}

export class removed_folder extends DeviceIdPayload { }

export class updated_folder extends added_folder { }
