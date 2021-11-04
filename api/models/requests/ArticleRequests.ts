import { Required } from "../../utils/decorators.js";
import { BaseRequest } from "./BaseRequests.js";

/**
 * article
 */
export class ArticleRequest extends BaseRequest {
    @Required url: string

    constructor(r: any) {
        super()
        this.url = String(r.url);
    }
}