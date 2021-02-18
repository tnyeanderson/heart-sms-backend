import { Expose } from "class-transformer";
import { AccountIdRequest, BaseRequest, HasItemsRequest, LimitOffsetRequest, UpdateDeviceIdRequest, UpdateRequest } from "./BaseRequests.js";


/**
 * templates/add
 */
class TemplatesAddItem extends BaseRequest {
    @Expose() device_id: number = -1;
    @Expose() text: string = '';
}

export class TemplatesAddRequest extends HasItemsRequest {
    // Body
    templates: TemplatesAddItem[] = [new TemplatesAddItem];

    static itemsPropName = 'templates';
}


/**
 * templates/update/:device_id
 */
export class TemplatesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Expose() text: string = '';
}