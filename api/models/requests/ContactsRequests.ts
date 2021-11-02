import { Expose } from "class-transformer";
import util from "../../utils/util.js";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * contacts/remove_device_id
 */
export class ContactsRemoveDeviceIdRequest extends AccountIdRequest {
    // Query
    public phone_number: string
    public device_id: number;

    constructor(r: any) {
        super(r);
        this.phone_number = String(r.phone_number);
        this.device_id = Number(r.device_id);
    }


    static required = [
        ...super.required,
        'phone_number',
        'device_id'
    ]
}


/**
 * contacts/remove_ids/:ids
 */
export class ContactsRemoveIdsRequest extends AccountIdRequest {
    // URL params
    public ids: string;

    constructor(r: any) {
        super(r);
        this.ids = String(r.ids);
    }


    static required = [...super.required, 'ids'];
}



/**
 * contacts/add
 */
class ContactsAddItem extends BaseRequest {
    public device_id: number;
    public phone_number: string;
    public id_matcher: string;
    public name: string;
    public color: number;
    public color_dark: number;
    public color_light: number;
    public color_accent: number;
    public contact_type: number;

    constructor (r: any) {
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
    public contacts: ContactsAddItem[];

    constructor(r: any) {
        super(r);
        this.contacts = ContactsAddRequest.createItems(r.contacts);
    }


    static itemsPropName = 'contacts';
    static itemsPropType = ContactsAddItem;
}



/**
 * contacts/update_device_id
 */
export class ContactsUpdateDeviceIdRequest extends UpdateDeviceIdRequest {
    // Query
    // Included in base class
    // @Expose() device_id: number = -1;

    // Body
    public phone_number?: string;
    public name?: string;
    public color?: number;
    public color_dark?: number;
    public color_light?: number;
    public color_accent?: number;

    constructor(r: any) {
        super(r);
        !util.propMissing(r, 'phone_number') && (this.phone_number = String(r.phone_number));
        !util.propMissing(r, 'name') && (this.name = String(r.name));
        !util.propMissing(r, 'color') && (this.color = Number(r.color));
        !util.propMissing(r, 'color_dark') && (this.color_dark = Number(r.color_dark));
        !util.propMissing(r, 'color_light') && (this.color_light = Number(r.color_light));
        !util.propMissing(r, 'color_accent') && (this.color_accent = Number(r.color_accent));
    }


    static optional = ['phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent'];
    static atLeastOne = true;
}