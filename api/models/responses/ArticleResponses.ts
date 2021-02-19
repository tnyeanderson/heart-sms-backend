import { Expose } from "class-transformer";
import { BaseResponse } from "./BaseResponse.js";

export class ArticleResponse extends BaseResponse {
    @Expose() title!: string;
    @Expose({name: 'excerpt'}) description!: string;
    @Expose({name: 'lead_image_url'}) image_url!: string;
    @Expose() domain!: string;
    @Expose({name: 'url'}) web_url!: string;
}