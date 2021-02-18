import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";
import { Request } from 'express';


/**
 * contacts/remove_device_id
 */
export class ContactsRemoveDeviceIdRequest extends AccountIdRequest {
    // Query
    @Expose() phone_number: string = '';
    @Expose() device_id: number = -1;
}


/**
 * contacts/remove_ids/:ids
 */
export class ContactsRemoveIdsRequest extends AccountIdRequest {
    // URL params
    @Expose() ids: string = '';
}



/**
 * contacts/add
 */
class ContactsAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() phone_number: string = '';
    @Expose() id_matcher: string = '';
    @Expose() name: string = '';
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;
    @Expose() contact_type: number = -1;
}

export class ContactsAddRequest extends HasItemsRequest {
    // Body
    contacts: ContactsAddItem[] = [new ContactsAddItem];

    static itemsPropName = 'contacts';
}



/**
 * contacts/update_device_id
 */
export class ContactsUpdateDeviceIdRequest extends UpdateDeviceIdRequest {
    // Query
    // Included in base class
    // @Expose() device_id: number = -1;

    // Body
    @Expose() phone_number: string = '';
    @Expose() name: string = '';
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;

    static optional = ['phone_number', 'name', 'color', 'color_dark', 'color_light', 'color_accent'];
    static atLeastOne = true;
}