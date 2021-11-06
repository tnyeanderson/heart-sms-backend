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
	// We MUST include the r here to avoid errors when calling new this(r) in .create()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	constructor(r?: any) {  }


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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static validate (item: Request | any)  {
		// Combine request query, body, and url parameters into a single object
		// If plain object, just use that
		const toValidate = (item.query && item.body && item.params) ? Object.assign(item.query, item.body, item.params) : item;

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
	static create(item: Request) {
		// Combine request query, body, and url parameters into a single object
		// If plain object, just use that
		const r = (item.query && item.body && item.params) ? Object.assign(item.query, item.body, item.params) : item;
		// (this) indicates the calling class
		return new this(r);
	}

	/**
	 *
	 * @param name The name of the property
	 * @param sourceObj The object to get the property from
	 * @param Cast The function used to cast the value to the proper type
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setOptional(name: string, sourceObj: any, Cast: (arg: unknown) => boolean | string | number) {
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

	constructor(r: AccountIdRequest) {
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
	constructor(r: HasItemsRequest) { super(r) }

	/**
	 * Name of the property which stores the list of items
	 * Must be extended
	 */
	static itemsPropName = '';

	/**
	 * Type of each item in this[itemsPropName]
	 *
	 * This will be something like BlacklistsAddItem
	 */
	// Must be type any so it can be overwritten to the new type
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static itemsPropType: any = BaseRequest

	/**
	 * Validate each of the items stored in the items property
	 * @param req Express request
	 */
	static validate(req: Request) {
		const prop = this.itemsPropName;
		const items = req.body[prop];

		if (!items || (Array.isArray(items) && items.length === 0)) {
			throw new MissingParamError(prop);
		}

		items.forEach((item: unknown) => this.itemsPropType.validate(item));

		// Items are valid
		// Perform request schema validation
		super.validate(req);
	}

	/**
	 * Returns an array of instances of the calling class from an array of objects
	 * @param items list of items to be casted to instance of calling class
	 */
	static createItems(items: unknown[]) {
		return items.map(item => this.itemsPropType.create(item));
	}
}


/**
 * Update requests can generate an update string
 */
export class UpdateRequest extends AccountIdRequest {
	constructor(r: UpdateRequest) { super(r) }

	/**
	 * Generates an object with all class properties minus account_id
	 */
	toUpdate(): object {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {account_id, ...out} = this;
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

	constructor(r: DeviceIdRequest) {
		super(r);
		this.device_id = Number(r.device_id);
	}
}


/**
 * Update requests can generate an update string
 * Used when a device_id is included (usually by URL param)
 */
export class UpdateDeviceIdRequest extends DeviceIdRequest {
	constructor(r: UpdateDeviceIdRequest) { super(r) }

	/**
	 * Generates an object with all class properties minus account_id and device_id
	 */
	toUpdate() {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {account_id, device_id, ...out} = this;
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
	@Optional limit = -1;
	@Optional offset = -1;

	constructor(r: LimitOffsetRequest) {
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

