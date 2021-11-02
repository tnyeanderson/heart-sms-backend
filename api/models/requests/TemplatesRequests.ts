import { Expose } from "class-transformer";
import { BaseRequest, HasItemsRequest, UpdateDeviceIdRequest } from "./BaseRequests.js";


/**
 * templates/add
 */
class TemplatesAddItem extends BaseRequest {
    public device_id: number;
    public text: string;

    constructor(r: any) {
        super()
        this.device_id = Number(r.device_id);
        this.text = String(r.text);
    }


    static required = [
        ...super.required,
        'device_id',
        'text'
    ]
}

export class TemplatesAddRequest extends HasItemsRequest {
    // Body
    public templates: TemplatesAddItem[];

    constructor(r: any) {
        super(r);
        this.templates = TemplatesAddRequest.createItems(r.templates);
    }


    static itemsPropName = 'templates';
    static itemsPropType = TemplatesAddItem;
}


/**
 * templates/update/:device_id
 */
export class TemplatesUpdateRequest extends UpdateDeviceIdRequest {
    // Body
    public text: string;

    constructor(r: any) {
        super(r);
        this.text = String(r.text);
    }


    static required = [
        ...super.required,
        'text'
    ]
}