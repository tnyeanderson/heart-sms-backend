import { Required } from "../../utils/decorators.js";
import { BaseRequest } from "./BaseRequests.js";

/**
 * activate
 */
export class ActivateRequest extends BaseRequest {
	@Required activation_code: string;

	constructor(r: ActivateRequest) {
		super();
		this.activation_code = String(r.activation_code)
	}
}