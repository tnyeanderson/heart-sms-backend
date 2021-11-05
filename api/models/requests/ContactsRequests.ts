import { AtLeastOne, ItemsProp, Optional, Required } from "../../utils/decorators.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * contacts/remove_device_id
 */
export class ContactsRemoveDeviceIdRequest extends AccountIdRequest {
    // Query
    @Required phone_number: string
    @Required device_id: number;

    constructor(r: ContactsRemoveDeviceIdRequest) {
        super(r);
        this.phone_number = String(r.phone_number);
        this.device_id = Number(r.device_id);
    }
}


/**
 * contacts/remove_ids/:ids
 */
export class ContactsRemoveIdsRequest extends AccountIdRequest {
    // URL params
    @Required ids: string;

    constructor(r: ContactsRemoveIdsRequest) {
        super(r);
        this.ids = String(r.ids);
    }
}



/**
 * contacts/add
 */
class ContactsAddItem extends BaseRequest {
    @Required device_id: number;
    @Required phone_number: string;
    @Required id_matcher: string;
    @Required name: string;
    @Required color: number;
    @Required color_dark: number;
    @Required color_light: number;
    @Required color_accent: number;
    @Required contact_type: number;

    constructor (r: ContactsAddItem) {
        super();
        this.device_id = Number(r.device_id);
        this.phone_number = String(r.phone_number);
        this.id_matcher = String(r.id_matcher);
        this.name = String(r.name);
        this.color = Number(r.color);
        this.color_dark = Number(r.color_dark);
        this.color_light = Number(r.color_light);
        this.color_accent = Number(r.color_accent);
        this.contact_type = Number(r.contact_type);
    }
}

export class ContactsAddRequest extends HasItemsRequest {
    // Body
    @ItemsProp contacts: ContactsAddItem[];

    constructor(r: ContactsAddRequest) {
        super(r);
        this.contacts = ContactsAddRequest.createItems(r.contacts);
    }

    static itemsPropType = ContactsAddItem;
}



/**
 * contacts/update_device_id
 */
@AtLeastOne
export class ContactsUpdateDeviceIdRequest extends UpdateDeviceIdRequest {
    // Query
    // Included in base class

    // Body
    @Optional phone_number?: string;
    @Optional name?: string;
    @Optional color?: number;
    @Optional color_dark?: number;
    @Optional color_light?: number;
    @Optional color_accent?: number;

    constructor(r: ContactsUpdateDeviceIdRequest) {
        super(r);
        this.setOptional('phone_number', r, String);
        this.setOptional('name', r, String);
        this.setOptional('color', r, Number);
        this.setOptional('color_dark', r, Number);
        this.setOptional('color_light', r, Number);
        this.setOptional('color_accent', r, Number);
    }
}