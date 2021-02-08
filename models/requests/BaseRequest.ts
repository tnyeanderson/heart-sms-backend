import { Expose } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import util from "../../utils/util.js";
import { InvalidAccountError } from "../responses/ErrorResponses.js";

/**
 * Performs schema validation for derived classes
 * Used for requests which do not require an account_id
 */
export class _BaseRequest {
    static validate (req: Request, res: Response, next: NextFunction) {
        next();
    }
}

/**
 * Most requests require an account_id in either the body or the query
 * This adds validation
 */
export class BaseRequest extends _BaseRequest {
    static validate (req: Request, res: Response, next: NextFunction) {
        // Ensure account_id exists
        if (!util.getAccountId(req)) {
            res.json(new InvalidAccountError);
            return;
        }
        super.validate(req, res, next);
    }
}