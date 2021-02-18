import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, DeviceIdRequest, HasItemsRequest, UpdateDeviceIdRequest, UpdateRequest } from "./BaseRequests.js";
import { Request } from 'express';


/**
 * folders/add
 */
class FoldersAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() name: string = '';
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;
}

export class FoldersAddRequest extends HasItemsRequest {
    // Body
    folders: FoldersAddItem[] = [new FoldersAddItem];

    static itemsPropName = 'folders';

}


/**
 * folders/update/:device_id
 */
export class FoldersUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() name: string = '';
    @Expose() color: number = -1;
    @Expose() color_dark: number = -1;
    @Expose() color_light: number = -1;
    @Expose() color_accent: number = -1;
}
