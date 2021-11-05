import { Required } from "../../utils/decorators.js";
import { BaseRequest } from "./BaseRequests.js";

/**
 * article
 */
export class ArticleRequest extends BaseRequest {
    @Required url: string

    constructor(r: ArticleRequest) {
        super()
        this.url = String(r.url);
    }
}