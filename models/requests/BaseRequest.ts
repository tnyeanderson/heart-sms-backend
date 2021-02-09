import { Expose, plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import util from "../../utils/util.js";
import { InvalidAccountError, MissingParamError } from "../responses/ErrorResponses.js";

/**
 * Performs schema validation for derived classes
 * Used for requests which do not require an account_id
 */
export class _BaseRequest {
    /**
     * Array of query or body parameters that are optional
     */
    static optional: string[] = [];

    /**
     * Array of query parameters expected in the request
     * Also define in optional if not required
     */
    static query: string[] = []

    /**
     * 
     * @param prop Returns true if prop is not in optional (aka is required), false otherwise
     */
    static required(prop: string) {
        return (!this.optional.includes(prop))
    }

    /**
     * Schema validation
     */
    static validate (req: Request, res: Response) {
        // Get body properties by filtering out query params
        let body = Object.getOwnPropertyNames(new this).filter(param => !this.query.includes(param));

        // Validate request body against derived class properties
        body.forEach((param) => {
            if ((req.body[param] === undefined || req.body[param] === "") && this.required(param)) {
                console.log(param);
                // Property is required but not set (or is empty)
                res.json(new MissingParamError(param));
                return false;
            }
        });

        // Validate request query against those defined in derived class's `query` array
        this.query.forEach((param) => {
            if (req.query[param] === undefined && this.required(param)) {
                // Query parameter is required but not set
                res.json(new MissingParamError(param));
                return false;
            }
        });

        return true; // Validated
    }


    /**
     * Handler middlware
     * Called from controller to validate and append typed Request to res.locals
     */
    static handler (req: Request, res: Response, next: NextFunction) {
        if (this.validate(req, res)) {
            res.locals.request = this.create(req);
            next()
        } else {
            next('Error');
        }
    }

    /**
     * Creates a 'request' to be appended to res.locals
     */
    static create(req: Request) {
        // (this) indicates the calling class
        return plainToClass(this, Object.assign(req.query, req.body), { excludeExtraneousValues: true });
    }
}

/**
 * Most requests require an account_id in either the body or the query
 * This adds validation
 */
export class BaseRequest extends _BaseRequest {
    @Expose() account_id: string = '';

    /**
     * Ensure account_id exists before performing schema validation
     */
    static validate (req: Request, res: Response) {
        let account_id = util.getAccountId(req);

        if (!account_id) {
            res.json(new InvalidAccountError);
            return false;
        } else {
            // Success - add it to the body so it is always parsed in handler()
            req.body.account_id = account_id;
        }

        // Perform schema validation
        return super.validate(req, res);
    }
}
