import { ItemsProp, Required } from "../../utils/decorators.js";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * templates/add
 */
class TemplatesAddItem extends BaseRequest {
    @Required device_id: number;
    @Required text: string;

    constructor(r: TemplatesAddItem) {
        super()
        this.device_id = Number(r.device_id);
        this.text = String(r.text);
    }
}

export class TemplatesAddRequest extends HasItemsRequest {
    // Body
    @ItemsProp templates: TemplatesAddItem[];

    constructor(r: TemplatesAddRequest) {
        super(r);
        this.templates = TemplatesAddRequest.createItems(r.templates);
    }

    static itemsPropType = TemplatesAddItem;
}


/**
 * templates/update/:device_id
 */
export class TemplatesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    @Required text: string;

    constructor(r: TemplatesUpdateRequest) {
        super(r);
        this.text = String(r.text);
    }
}