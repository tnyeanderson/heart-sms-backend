import { Expose } from "class-transformer";
import { BaseRequest } from "./BaseRequests.js";

/**
 * article
 */
export class ArticleRequest extends BaseRequest {
    // Body
    @Expose() url: string = '';
}