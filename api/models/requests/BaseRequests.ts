import { Expose, plainToClass } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import { ErrorResponse, MissingParamError } from "../responses/ErrorResponses.js";



/**
 * 
 * For Request classes, all properties are assigned default values according to their type
 * This way we can instantiate the class and use its properties for validation
 * After being validated, class-transformer is used to create instances
 * The main entrypoint for this is .handler()
 * 
 */



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
    constructor() { }


    /**
     * Array of query or body parameters that are optional
     */
    static optional: string[] = [];


    /**
     * Whether at least one parameter in optional must be present
     */
    static atLeastOne = false;


    /**
     * 
     * @param prop Returns true if prop is not in optional (aka is required), false otherwise
     */
    static required(prop: string) {
        return (!this.optional.includes(prop))
    }

    /**
     * Schema validation
     * It really doesn't matter whether the value is in the url parameters, body, or query.
     * They are all combined before validation
     * Conventions are in api.md and comments in the Request definitions
     */
    static validate (item: Request | any) : boolean | ErrorResponse  {
        // Get properties of an instance of the calling class
        let props = Object.getOwnPropertyNames(new this);

        // Combine request query, body, and url parameters into a single object
        // If plain object, just use that
        let toValidate = (item.query && item.body && item.params) ? Object.assign(item.query, item.body, item.params) : item;

        // Used for atLeastOne
        let optionalButPresent = 0;

        // Validate request against derived class properties
        for (let i=0, len=props.length; i<len; i++) {
            let prop = props[i];
            let required = this.required(prop);
            let missing = (toValidate[prop] === undefined || toValidate[prop] === "");

            if (required && missing) {
                // Property is required but not set (or is empty)
                return new MissingParamError(prop);
            } else if (!required && !missing) {
                // Variable is optional but has a value.
                optionalButPresent++;
            }
        }

        if (this.atLeastOne && optionalButPresent === 0) {
            // At least one property from optional must be included, but none are
            return new MissingParamError();
        }

        return true; // Validated
    }

    /**
     * Handler middlware
     * Called from controller to validate and append typed Request to res.locals
     */
    static handler (req: Request, res: Response, next: NextFunction) {
        let validated = this.validate(req);
        let error = new ErrorResponse();

        if (validated === true) {
            res.locals.request = this.create(req);
            next()
        } else {
            error = (validated instanceof ErrorResponse) ? validated : error;
            next(error);
        }
    }

    /**
     * Creates a 'request' to be appended to res.locals that contains all parameters from the url, query, and body
     */
    static create(req: Request, plain?: any) {
        let toAssign = plain || Object.assign(req.query, req.body, req.params);
        // (this) indicates the calling class
        return this.createItem(toAssign);
    }

    /**
     * Actually casts the item to a member of the calling class
     * Usually called directly by create(), but create() can be overwritten (e.g. for /add requests) to create a list of items
     * This will be overwritten by /add requests (HasItemsRequest) to create each item in the array
     * @param item Either an item in an array of a request (e.g. /add) or a combination of query, body, and url parameters
     */
    static createItem(item: any) {
        return plainToClass(this, item, { excludeExtraneousValues: true, enableImplicitConversion: true })
    }

    
}






/**
 * Most requests require an account_id in either the body or the query
 * This adds validation
 */
export class AccountIdRequest extends BaseRequest {
    @Expose() account_id: string = '';

    /**
     * Helper method which calls db.whereAccount with the class instance's account_id
     */
    whereAccount() {
        return db.whereAccount(this.account_id);
    }
}


export class HasItemsRequest extends AccountIdRequest {
    /**
     * Name of the property which stores the list of items
     * Must be extended
     */
    static itemsPropName: string = '';

    /**
     * Using the first item in the list, get the type of the list items.
     * This is why static items properties have e.g. [new BlacklistsAddItem] as the default value
     */
    static getItemsType() {
        let requestObject: any = new this;
        // The constructor will return the class from which the first item in the list was instantiated
        return requestObject[this.itemsPropName][0].constructor;
    }

    /**
     * Validate each of the items stored in the items property
     * @param req Express request
     */
    static validateItems(req: Request) {
        let prop = this.itemsPropName;
        let items = req.body[prop];

        if (!items || items === []) {
            return new MissingParamError(prop);
        } 

        let itemsType = this.getItemsType();

        for (let i=0, len=items.length; i<len; i++) {
            let itemValid = itemsType.validate(items[i]);

            // Return any errors
            if (itemValid !== true) {
                return itemValid;
            }
        }

        // Items are valid
        // Perform request schema validation
        return this.validate(req);
    }

    /**
     * Creates an instance of the items type for a given raw item
     * @param item the item from the request body
     */
    static createItem(item: any) {
        return this.getItemsType().createItem(item);
    }

    /**
     * Returns an array of instances of the calling class from an array of objects
     * @param items list of items to be casted to instance of calling class
     */
    static createItems(items: any[]) {
        let out: any[] = [];
        items.forEach((item: any) => {
            out.push(this.createItem(item));
        })
        return out;
    }

    /**
     * Returns a request object with an array of items in it
     * @param req Express request
     */
    static createWithItems(req: Request) {
        let prop = this.itemsPropName;
        let out: any = new this;

        // This is always set because validate is called before create
        out.account_id = Object.assign(req.body, req.query).account_id;

        out[prop] = this.createItems(req.body[prop]);
        
        return out
    }

    /**
     * Overrides the default handler to include item validation and creation
     * @param req 
     * @param res 
     * @param next 
     */
    static handler(req: Request, res: Response, next: NextFunction) {
        let validated = this.validateItems(req);
        let error = new ErrorResponse();

        if (validated === true) {
            res.locals.request = this.create(req);
            next()
        } else {
            error = (validated instanceof ErrorResponse) ? validated : error;
            next(error);
        }
    }

    /** 
     * Calls createWithItems to override the default create command.
     * Can be extended to also include other properties in the request (e.g. device_conversation_id)
     */
    static create(req: Request) {
        return this.createWithItems(req);
    }
}


/**
 * Update requests can generate an update string
 */
export class UpdateRequest extends AccountIdRequest {
    /**
     * Generates an object with all class properties minus account_id
     */
    toUpdate() {
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
    @Expose() device_id: number = -1;
}


/**
 * Update requests can generate an update string
 * Used when a device_id is included (usually by URL param)
 */
export class UpdateDeviceIdRequest extends DeviceIdRequest {
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
    @Expose() limit: number = -1;
    @Expose() offset: number = -1;

    static optional = ['limit', 'offset'];

    /**
     * Helper method to call db.limitStr()
     */
    limitStr() {
        return db.limitStr(Number(this.limit), Number(this.offset));
    }
}

