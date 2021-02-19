import { Expose } from "class-transformer";
import { BaseRequest } from "./BaseRequests.js";

/**
 * activate
 */
export class ActivateRequest extends BaseRequest {
    // Query
    @Expose() activation_code: string = '';
}