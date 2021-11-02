import { Expose } from "class-transformer";
import util from "../../utils/util.js";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";

/**
 * conversations/folder/:folder_id
 */
export class ConversationsFolderRequest extends AccountIdRequest {
    // Query
    public folder_id: number;

    constructor(r: any) {
        super(r);
        this.folder_id = Number(r.folder_id);
    }


    static required = [
        ...super.required,
        'folder_id'
    ]
}



/**
 * conversations/add
 */
class ConversationsAddItem extends BaseRequest {
    public device_id: number;
    public folder_id: number;
    public color: number;
    public color_dark: number;
    public color_light: number;
    public color_accent: number;
    public led_color: number;
    public pinned: boolean;
    public read: boolean;
    public timestamp: number;
    public title: string;
    public phone_numbers: string;
    public snippet: string;
    public id_matcher: string;
    public mute: boolean;
    public archive: boolean;
    public private_notifications: boolean;
    public ringtone?: string;
    public image_uri?: string;

    constructor(r: any) {
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
        !util.propMissing(r, 'ringtone') && (this.ringtone = String(r.ringtone));
        !util.propMissing(r, 'image_uri') && (this.image_uri = String(r.image_uri));
    }


    static required = [
        ...super.required,
        'device_id',
        'folder_id',
        'color',
        'color_dark',
        'color_light',
        'color_accent',
        'led_color',
        'pinned',
        'read',
        'timestamp',
        'title',
        'phone_numbers',
        'snippet',
        'id_matcher',
        'mute',
        'archive',
        'private_notifications'
    ]

    static optional = ['ringtone', 'image_uri'];
}

export class ConversationsAddRequest extends HasItemsRequest {
    // Body
    conversations: ConversationsAddItem[];

    constructor(r: any) {
        super(r);
        this.conversations = ConversationsAddRequest.createItems(r.conversations);
    }


    static itemsPropName = 'conversations';
    static itemsPropType = ConversationsAddItem;
}



/**
 * conversations/update/:device_id
 */
export class ConversationsUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public color?: number;
    public color_dark?: number;
    public color_light?: number;
    public color_accent?: number;
    public led_color?: number;
    public pinned?: boolean;
    public read?: boolean;
    public timestamp?: number;
    public title?: string;
    public snippet?: string;
    public ringtone?: string;
    public mute?: boolean;
    public archive?: boolean;
    public private_notifications?: boolean;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'color') && (this.color = Number(r.color));
        !util.propMissing(r, 'color_dark') && (this.color_dark = Number(r.color_dark));
        !util.propMissing(r, 'color_light') && (this.color_light = Number(r.color_light));
        !util.propMissing(r, 'color_accent') && (this.color_accent = Number(r.color_accent));
        !util.propMissing(r, 'led_color') && (this.led_color = Number(r.led_color));
        !util.propMissing(r, 'pinned') && (this.pinned = Boolean(r.pinned));
        !util.propMissing(r, 'read') && (this.read = Boolean(r.read));
        !util.propMissing(r, 'timestamp') && (this.timestamp = Number(r.timestamp));
        !util.propMissing(r, 'title') && (this.title = String(r.title));
        !util.propMissing(r, 'snippet') && (this.snippet = String(r.snippet));
        !util.propMissing(r, 'ringtone') && (this.ringtone = String(r.ringtone));
        !util.propMissing(r, 'mute') && (this.mute = Boolean(r.mute));
        !util.propMissing(r, 'archive') && (this.archive = Boolean(r.archive));
        !util.propMissing(r, 'private_notifications') && (this.private_notifications = Boolean(r.private_notifications));
    }


    static optional = [
        'color',
        'color_dark',
        'color_light',
        'color_accent',
        'led_color',
        'pinned',
        'read',
        'timestamp',
        'title',
        'snippet',
        'ringtone',
        'mute',
        'archive',
        'private_notifications'
    ];

    static atLeastOne = true;
}


/**
 * conversations/update_snippet/:device_id
 */
export class ConversationsUpdateSnippetRequest extends UpdateDeviceIdRequest {
    // Body
    public read?: boolean;
    public timestamp?: number;
    public snippet?: string;
    public archive?: boolean;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'read') && (this.read = Boolean(r.read));
        !util.propMissing(r, 'timestamp') && (this.timestamp = Number(r.timestamp));
        !util.propMissing(r, 'snippet') && (this.snippet = String(r.snippet));
        !util.propMissing(r, 'archive') && (this.archive = Boolean(r.archive));
    }


    static optional = ['read', 'timestamp', 'snippet', 'archive'];
    static atLeastOne = true;
}


/**
 * conversations/update_title/:device_id
 */
export class ConversationsUpdateTitleRequest extends UpdateDeviceIdRequest {
    // Query
    public title: string;

    constructor(r: any) {
        super(r);
        this.title = String(r.title);
    }


    static required = [...super.required, 'title'];
}


/**
 * conversations/read/:device_id
 */
export class ConversationsReadRequest extends DeviceIdRequest {
    // Query
    public android_device?: string;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'android_device') && (this.android_device = String(r.android_device));
    }


    static optional = ['android_device'];
}


/**
 * conversations/seen/:device_conversation_id
 */
export class ConversationsSeenRequest extends AccountIdRequest {
    // URL params
    public device_conversation_id: number;

    constructor(r: any) {
        super(r);
        this.device_conversation_id = Number(r.device_conversation_id);
    }


    static required = [...super.required, 'device_conversation_id'];
}


/**
 * conversations/add_to_folder/:device_id
 */
export class ConversationsAddToFolderRequest extends DeviceIdRequest {
    // Query
    public folder_id: number;

    constructor(r: any) {
        super(r);
        this.folder_id = Number(r.folder_id);
    }


    static required = [...super.required, 'folder_id'];
}


/**
 * conversations/cleanup_messages/:device_id
 */
export class ConversationsCleanupMessagesRequest extends AccountIdRequest {
    // Query
    public conversation_id: number;
    public timestamp: number;

    constructor(r: any) {
        super(r);
        this.conversation_id = Number(r.conversation_id);
        this.timestamp = Number(r.timestamp);
    }


    static required = [...super.required, 'conversation_id', 'timestamp'];
}