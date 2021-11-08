import { ItemsProp, Required } from "../../utils/decorators.js";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";

/**
 * folders/add
 */
export class FoldersAddItem extends BaseRequest {
	@Required device_id: number;
	@Required name: string;
	@Required color: number;
	@Required color_dark: number;
	@Required color_light: number;
	@Required color_accent: number;

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

export class FoldersAddRequest extends HasItemsRequest {
	// Body
	@ItemsProp folders: FoldersAddItem[];

	constructor(r: FoldersAddRequest) {
		super(r);
		this.folders = FoldersAddRequest.createItems(r.folders);
	}

	static itemsPropType = FoldersAddItem;
}

/**
 * folders/update/:device_id
 */
export class FoldersUpdateRequest extends UpdateDeviceIdRequest {
	// Body
	@Required name: string;
	@Required color: number;
	@Required color_dark: number;
	@Required color_light: number;
	@Required color_accent: number;

	constructor(r: FoldersUpdateRequest) {
		super(r);
		this.name = String(r.name);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
	}
}
