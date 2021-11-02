import { Expose } from "class-transformer";
import { MissingParamError } from "../responses/ErrorResponses.js";
import { BaseRequest } from "./BaseRequests.js";

/**
 * activate
 */
export class ActivateRequest extends BaseRequest {
    public activation_code: string;

    constructor(r: any) {
        super();
        this.activation_code = String(r.activation_code)
    }

    static required = [
        ...super.required,
        'activation_code'
    ]
}