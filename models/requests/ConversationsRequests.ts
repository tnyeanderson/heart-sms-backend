import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, HasItemsRequest, UpdateDeviceIdRequest, UpdateRequest } from "./BaseRequests.js";
import { Request } from 'express';

/**
 * conversations/folder/:folder_id
 */
export class ConversationsFolderRequest extends AccountIdRequest {
    // Query
    @Expose() folder_id: number = -1;
}



/**
 * conversations/add
 */
class ConversationsAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() folder_id: number = -1;
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;
    @Expose() led_color: number = -1;
    @Expose() pinned: boolean = false;
    @Expose() read: boolean = false;
    @Expose() timestamp: number = -1;
    @Expose() title: string = '';
    @Expose() phone_numbers: string = '';
    @Expose() snippet: string = '';
    @Expose() ringtone: string = '';
    @Expose() image_uri: string = '';
    @Expose() id_matcher: string = '';
    @Expose() mute: boolean = false;
    @Expose() archive: boolean = false;
    @Expose() private_notifications: boolean = false;

    static optional = ['ringtone', 'image_uri'];
}

export class ConversationsAddRequest extends HasItemsRequest {
    // Body
    conversations: ConversationsAddItem[] = [new ConversationsAddItem];

    static itemsPropName = 'conversations';
}



/**
 * conversations/update/:device_id
 */
export class ConversationsUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;
    @Expose() led_color: number = -1;
    @Expose() pinned: boolean = false;
    @Expose() read: boolean = false;
    @Expose() timestamp: number = -1;
    @Expose() title: string = '';
    @Expose() snippet: string = '';
    @Expose() ringtone: string = '';
    @Expose() mute: boolean = false;
    @Expose() archive: boolean = false;
    @Expose() private_notifications: boolean = false;

    static optional = ['color', 'color_dark', 'color_light', 'color_accent', 'led_color', 'pinned', 'read', 'timestamp', 'title', 'snippet', 'ringtone', 'mute', 'archive', 'private_notifications'];
    static atLeastOne = true;
}


/**
 * conversations/update_snippet/:device_id
 */
export class ConversationsUpdateSnippetRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() read: boolean = false;
    @Expose() timestamp: number = -1;
    @Expose() snippet: string = '';
    @Expose() archive: boolean = false;

    static optional = ['read', 'timestamp', 'snippet', 'archive'];
    static atLeastOne = true;
}


/**
 * conversations/update_snippet/:device_id
 */
export class ConversationsUpdateTitleRequest extends UpdateDeviceIdRequest {
    // Query
    @Expose() title: string = '';
}


/**
 * conversations/read/:device_id
 */
export class ConversationsReadRequest extends DeviceIdRequest {
    // Query
    @Expose() android_device: string = '';

    static optional = ['android_device'];
}


/**
 * conversations/seen/:device_conversation_id
 */
export class ConversationsSeenRequest extends AccountIdRequest {
    // URL params
    @Expose() device_conversation_id: number = -1;
}


/**
 * conversations/add_to_folder/:device_id
 */
export class ConversationsAddToFolderRequest extends DeviceIdRequest {
    // Query
    @Expose() folder_id: number = -1;
}


/**
 * conversations/cleanup_messages/:device_id
 */
export class ConversationsCleanupMessagesRequest extends AccountIdRequest {
    // Query
    @Expose() conversation_id: number = -1;
    @Expose() timestamp: number = -1;
}