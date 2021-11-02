import { Expose } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import users from '../../helpers/UserHelper.js';
import util from "../../utils/util.js";
import { BaseError } from "../errors/Errors.js";
import { DuplicateUserError, ErrorResponse, MissingParamError, ParamTypeError, UserNotAllowedError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest } from "./BaseRequests.js";


/**
 * accounts/signup
 */
export class SignupRequest extends BaseRequest {
    // Body
    public name: string;
    public password: string;
    public phone_number: string;
    public real_name: string;

    constructor(r: any) {
        super();
        this.name = String(r.name);
        this.password = String(r.password);
        this.phone_number = String(r.phone_number);
        this.real_name = String(r.real_name);
    }

    static required = [
        ...super.required,
        'name',
        'password',
        'phone_number',
        'real_name'
    ]

    /**
     * Express middleware to check whether a user is in HEART_ALLOWED_USERS
     * @param req 
     * @param res 
     * @param next 
     */
    static checkAllowedUser (req: Request, res: Response, next: NextFunction) {
        // res.locals.request is set from .handler()
        if (!users.isAllowed(res.locals.request.name)) {
            return next(new UserNotAllowedError);
        }

        return next();
    }

    /**
     * Async-aware express middleware that responds with an error if the user is a duplicate
     * @param req 
     * @param res 
     * @param next 
     */
    static async checkDuplicateUser (req: Request, res: Response, next: NextFunction) {
        // res.locals.request is set from .handler()
        let r = res.locals.request;

        let sql = `SELECT username FROM Accounts WHERE username = ${db.escape(r.name)}`;
    
        // Don't do the work to hash the password if the user already exists
        let result = await db.query(sql);

        if (result[0] && result[0].username === r.name) {
            // User exists
            return next(new DuplicateUserError);
        } else {
            // Continue to signup
            return next();
        }
    }
}


/**
 * accounts/login
 */
export class LoginRequest extends BaseRequest {
    public username: string;
    public password: string;

    constructor(r: any) {
        super()
        this.username = String(r.username);
        this.password = String(r.password);
    }

    static required = [
        ...super.required,
        'username',
        'password'
    ]
}


/**
 * accounts/dismissed_notification
 */
export class DismissedNotificationRequest extends AccountIdRequest {
    // Query
    public id: string;
    public device_id?: string;

    constructor(r: any) {
        super(r)
        this.id = String(r.id);
        !util.propMissing(r, 'device_id') && (this.device_id = String(r.device_id));
    }

    static required = [
        ...super.required,
        'id'
    ]
}


/**
 * accounts/update_setting
 */
export class UpdateSettingRequest extends AccountIdRequest {
    // Query
    public pref: string;
    public type: string;
    public value: any;

    constructor(r: any) {
        super(r);
        this.pref = String(r.pref);
        this.type = String(r.type);
        this.value = this.castValue(r.value)
    }

    static required = [
        ...super.required,
        'pref',
        'type',
        'value'
    ]

    castValue(value: any) {
        // Can it cast?
        switch (this.type) {
            case 'int':
            case 'long':
                return Number(value);
            case 'boolean':
                return Boolean(value)
            default:
                return String(value);
        }
    }

    static validate (req: Request) {
        // TODO: What?
        super.validate(req);

        let toValidate = Object.assign(req.query, req.body, req.params)
        let v = toValidate.value;

        let expectedType = toValidate.type;
        let uncastedType = typeof v;

        switch (uncastedType) {
            case 'string': // Should always be a string because it's in the query, but it might not be
            case 'number':
            case 'boolean':
                // Allowed
                break;
            default:
                // Other types are not allowed
                throw new ParamTypeError('value');
        }

        // Can it cast?
        switch (expectedType) {
            case 'int':
            case 'long':
                if (isNaN(Number(v))) {
                    throw new ParamTypeError('value');
                }
                break;
            case 'boolean':
                if ( !( // NOT
                    v === true || 
                    v === false || 
                    v === 'true' ||  
                    v === 'false' ||  
                    v === 0 || 
                    v === 1
                )) {
                    throw new ParamTypeError('value')
                }
            default:
                // the rest are cast as strings and work no matter what
                break;
        }

        // Validated
        return;
    }
}