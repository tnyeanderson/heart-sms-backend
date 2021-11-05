import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import { Optional, Required } from "../../utils/decorators.js";
import util from "../../utils/util.js";
import { MissingParamError } from "../responses/ErrorResponses.js";

/**
 * BaseRequest
 * 
 * Performs schema validation for derived classes
 * Used for requests which do not require an account_id
 */
export class BaseRequest {
    /**
     * Empty constructor
     */
    constructor(r?: any) { }


    /**
     * Array of query or body parameters that are required
     */
    static required: string[] = [];


    /**
     * Array of query or body parameters that are optional
     */
    static optional: string[] = [];


    /**
     * Whether at least one parameter in optional must be present
     */
    static atLeastOne = false;


    /**
     * Schema validation
     * It really doesn't matter whether the value is in the url parameters, body, or query.
     * They are all combined before validation
     * Conventions are in api.md and comments in the Request definitions
     */
    static validate (item: Request | any)  {
        // Combine request query, body, and url parameters into a single object
        // If plain object, just use that
        let toValidate = (item.query && item.body && item.params) ? Object.assign(item.query, item.body, item.params) : item;

        // Used for atLeastOne
        let optionalButPresent = 0;

        this.required.forEach(prop => {
            if (util.propMissing(toValidate, prop)) {
                // Property is required but not set (or is empty)
                throw new MissingParamError(prop);
            }
        });

        this.optional.forEach(prop => {
            if (!util.propMissing(toValidate, prop)) {
                // Property is optional but has a value.
                optionalButPresent++
            }
        })

        if (this.atLeastOne && optionalButPresent === 0) {
            // At least one property from optional must be included, but none are
            throw new MissingParamError();
        }

        return; // Validated
    }

    /**
     * Handler middlware
     * Called from controller to validate and append typed Request to res.locals
     */
    static handler (req: Request, res: Response, next: NextFunction) {
        try {
            this.validate(req);
        } catch (err: unknown) {
            return next(err)
        }
        
        res.locals.request = this.create(req);
        next();
    }

    /**
     * Creates a 'request' to be appended to res.locals that contains all parameters from the url, query, and body
     */
    static create(req: Request, plain?: any) {
        let r = plain || Object.assign(req.query, req.body, req.params);
        // (this) indicates the calling class
        return new this(r);
    }

    /**
     * Actually casts the item to a member of the calling class
     * Usually called directly by create(), but create() can be overwritten (e.g. for /add requests) to create a list of items
     * @param item Either an item in an array of a request (e.g. /add) or a combination of query, body, and url parameters
     * This will be overwritten by /add requests (HasItemsRequest) to create each item in the array
     */
    static createItem(item: any) {
        return new this(item);
    }

    /**
     * 
     * @param name The name of the property
     * @param sourceObj The object to get the property from
     * @param Cast The function used to cast the value to the proper type
     */
    setOptional(name: string, sourceObj: any, Cast: Function) {
        if (!util.propMissing(sourceObj, name)) {
            // @ts-expect-error TS7053
            this[name] = Cast(sourceObj[name])
        }
    }
}






/**
 * Most requests require an account_id in either the body or the query
 * This adds validation
 */
export class AccountIdRequest extends BaseRequest {
    @Required account_id: string;

    constructor(r: any) {
        super();
        this.account_id = String(r.account_id)
    }

    /**
     * Helper method which calls db.whereAccount with the class instance's account_id
     */
    whereAccount() {
        return db.whereAccount(this.account_id);
    }
}


export class HasItemsRequest extends AccountIdRequest {
    constructor(r: any) { super(r) }

    /**
     * Name of the property which stores the list of items
     * Must be extended
     */
    static itemsPropName: string = '';
    static itemsPropType: any = BaseRequest

    /**
     * Validate each of the items stored in the items property
     * @param req Express request
     */
    static validate(req: Request) {
        let prop = this.itemsPropName;
        let items = req.body[prop];

        if (!items || (Array.isArray(items) && items.length === 0)) {
            throw new MissingParamError(prop);
        }

        items.forEach((item: any) => this.itemsPropType.validate(item));

        // Items are valid
        // Perform request schema validation
        super.validate(req);
    }

    /**
     * Returns an array of instances of the calling class from an array of objects
     * @param items list of items to be casted to instance of calling class
     */
    static createItems(items: any[]) {
        return items.map((item: any) => this.itemsPropType.createItem(item));
    }
}


/**
 * Update requests can generate an update string
 */
export class UpdateRequest extends AccountIdRequest {
    constructor(r: any) { super(r) }

    /**
     * Generates an object with all class properties minus account_id
     */
    toUpdate(): any {
        let {account_id, ...out} = this;
        return out;
    }

    /**
     * Helper method to generate the update string from toUpdate()
     */
    updateStr() {
        return db.updateStr(this.toUpdate());
    }
}


/**
 * Many requests (deletes especially) require a device_id
 * This adds validation
 */
export class DeviceIdRequest extends AccountIdRequest {
    // Usually URL params
    @Required device_id: number;

    constructor(r: any) {
        super(r);
        this.device_id = Number(r.device_id);
    }
}


/**
 * Update requests can generate an update string
 * Used when a device_id is included (usually by URL param)
 */
export class UpdateDeviceIdRequest extends DeviceIdRequest {
    constructor(r: any) { super(r) }

    /**
     * Generates an object with all class properties minus account_id and device_id
     */
    toUpdate() {
        let {account_id, device_id, ...out} = this;
        return out;
    }

    /**
     * Helper method to generate the update string from toUpdate()
     */
    updateStr() {
        return db.updateStr(this.toUpdate());
    }
}


/**
 * Many GET requests can (optionally) set limit and offset for pagination
 */
export class LimitOffsetRequest extends AccountIdRequest {
    // Query
    @Optional limit: number = -1;
    @Optional offset: number = -1;

    constructor(r: any) {
        super(r);
        this.setOptional('limit', r, Number);
        this.setOptional('offset', r, Number);
    }

    /**
     * Helper method to call db.limitStr()
     */
    limitStr() {
        return db.limitStr(this.limit, this.offset);
    }
}

