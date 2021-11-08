import { AtLeastOne, ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";

/**
 * conversations/folder/:folder_id
 */
export class ConversationsFolderRequest extends AccountIdRequest {
	// Query
	@Required folder_id: number;

	constructor(r: ConversationsFolderRequest) {
		super(r);
		this.folder_id = Number(r.folder_id);
	}
}

/**
 * conversations/add
 */
export class ConversationsAddItem extends BaseRequest {
	@Required device_id: number;
	@Required folder_id: number;
	@Required color: number;
	@Required color_dark: number;
	@Required color_light: number;
	@Required color_accent: number;
	@Required led_color: number;
	@Required pinned: boolean;
	@Required read: boolean;
	@Required timestamp: number;
	@Required title: string;
	@Required phone_numbers: string;
	@Required snippet: string;
	@Required id_matcher: string;
	@Required mute: boolean;
	@Required archive: boolean;
	@Required private_notifications: boolean;
	@Optional ringtone?: string;
	@Optional image_uri?: string;

	constructor(r: ConversationsAddItem) {
		super();
		this.device_id = Number(r.device_id);
		this.folder_id = Number(r.folder_id);
		this.color = Number(r.color);
		this.color_dark = Number(r.color_dark);
		this.color_light = Number(r.color_light);
		this.color_accent = Number(r.color_accent);
		this.led_color = Number(r.led_color);
		this.pinned = Boolean(r.pinned);
		this.read = Boolean(r.read);
		this.timestamp = Number(r.timestamp);
		this.title = String(r.title);
		this.phone_numbers = String(r.phone_numbers);
		this.snippet = String(r.snippet);
		this.id_matcher = String(r.id_matcher);
		this.mute = Boolean(r.mute);
		this.archive = Boolean(r.archive);
		this.private_notifications = Boolean(r.private_notifications);
		this.setOptional('ringtone', r, String);
		this.setOptional('image_uri', r, String);
	}
}

export class ConversationsAddRequest extends HasItemsRequest {
	// Body
	@ItemsProp conversations: ConversationsAddItem[];

	constructor(r: ConversationsAddRequest) {
		super(r);
		this.conversations = ConversationsAddRequest.createItems(r.conversations);
	}

	static itemsPropType = ConversationsAddItem;
}

/**
 * conversations/update/:device_id
 */
@AtLeastOne
export class ConversationsUpdateRequest extends UpdateDeviceIdRequest {
	// Body
	@Optional color?: number;
	@Optional color_dark?: number;
	@Optional color_light?: number;
	@Optional color_accent?: number;
	@Optional led_color?: number;
	@Optional pinned?: boolean;
	@Optional read?: boolean;
	@Optional timestamp?: number;
	@Optional title?: string;
	@Optional snippet?: string;
	@Optional ringtone?: string;
	@Optional mute?: boolean;
	@Optional archive?: boolean;
	@Optional private_notifications?: boolean;

	constructor(r: ConversationsUpdateRequest) {
		super(r);
		this.setOptional('color', r, Number);
		this.setOptional('color_dark', r, Number);
		this.setOptional('color_light', r, Number);
		this.setOptional('color_accent', r, Number);
		this.setOptional('led_color', r, Number);
		this.setOptional('pinned', r, Boolean);
		this.setOptional('read', r, Boolean);
		this.setOptional('timestamp', r, Number);
		this.setOptional('title', r, String);
		this.setOptional('snippet', r, String);
		this.setOptional('ringtone', r, String);
		this.setOptional('mute', r, Boolean);
		this.setOptional('archive', r, Boolean);
		this.setOptional('private_notifications', r, Boolean);
	}
}

/**
 * conversations/update_snippet/:device_id
 */
@AtLeastOne
export class ConversationsUpdateSnippetRequest extends UpdateDeviceIdRequest {
	// Body
	@Optional read?: boolean;
	@Optional timestamp?: number;
	@Optional snippet?: string;
	@Optional archive?: boolean;

	constructor(r: ConversationsUpdateSnippetRequest) {
		super(r);
		this.setOptional('read', r, Boolean);
		this.setOptional('timestamp', r, Number);
		this.setOptional('snippet', r, String);
		this.setOptional('archive', r, Boolean);
	}
}

/**
 * conversations/update_title/:device_id
 */
export class ConversationsUpdateTitleRequest extends UpdateDeviceIdRequest {
	// Query
	@Required title: string;

	constructor(r: ConversationsUpdateTitleRequest) {
		super(r);
		this.title = String(r.title);
	}
}

/**
 * conversations/read/:device_id
 */
export class ConversationsReadRequest extends DeviceIdRequest {
	// Query
	@Optional android_device?: string;

	constructor(r: ConversationsReadRequest) {
		super(r);
		this.setOptional('android_device', r, String);
	}
}

/**
 * conversations/seen/:device_conversation_id
 */
export class ConversationsSeenRequest extends AccountIdRequest {
	// URL params
	@Required device_conversation_id: number;

	constructor(r: ConversationsSeenRequest) {
		super(r);
		this.device_conversation_id = Number(r.device_conversation_id);
	}
}

/**
 * conversations/add_to_folder/:device_id
 */
export class ConversationsAddToFolderRequest extends DeviceIdRequest {
	// Query
	@Required folder_id: number;

	constructor(r: ConversationsAddToFolderRequest) {
		super(r);
		this.folder_id = Number(r.folder_id);
	}
}

/**
 * conversations/cleanup_messages/:device_id
 */
export class ConversationsCleanupMessagesRequest extends AccountIdRequest {
	// Query
	@Required conversation_id: number;
	@Required timestamp: number;

	constructor(r: ConversationsCleanupMessagesRequest) {
		super(r);
		this.conversation_id = Number(r.conversation_id);
		this.timestamp = Number(r.timestamp);
	}
}
