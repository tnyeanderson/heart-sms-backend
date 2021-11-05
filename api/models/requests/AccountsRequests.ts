import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import users from '../../helpers/UserHelper.js';
import { Optional, Required } from "../../utils/decorators.js";
import { DuplicateUserError, ParamTypeError, UserNotAllowedError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest } from "./BaseRequests.js";


/**
 * accounts/signup
 */
export class SignupRequest extends BaseRequest {
    // Body
    @Required name: string;
    @Required password: string;
    @Required phone_number: string;
    @Required real_name: string;

    constructor(r: any) {
        super();
        this.name = String(r.name);
        this.password = String(r.password);
        this.phone_number = String(r.phone_number);
        this.real_name = String(r.real_name);
    }

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
        const r = res.locals.request;

        const sql = `SELECT username FROM Accounts WHERE username = ${db.escape(r.name)}`;
    
        // Don't do the work to hash the password if the user already exists
        const result = await db.query(sql);

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
    @Required username: string;
    @Required password: string;

    constructor(r: any) {
        super()
        this.username = String(r.username);
        this.password = String(r.password);
    }
}


/**
 * accounts/dismissed_notification
 */
export class DismissedNotificationRequest extends AccountIdRequest {
    // Query
    @Required id: string;
    @Optional device_id?: string;

    constructor(r: any) {
        super(r);
        this.id = String(r.id);
        this.setOptional('device_id', r, String);
    }
}


/**
 * accounts/update_setting
 */
export class UpdateSettingRequest extends AccountIdRequest {
    // Query
    @Required pref: string;
    @Required type: string;
    @Required value: any;

    constructor(r: any) {
        super(r);
        this.pref = String(r.pref);
        this.type = String(r.type);
        this.value = this.castValue(r.value)
    }

    castValue(value: any) {
        // Can it cast?
        switch (this.type) {
            case 'int':
            case 'long':
                return Number(value);
            case 'boolean':
                // Done this way because 'false' would evaluate to true
                if ([1, true, 'true'].includes(value)) {
                    return true;
                } else {
                    return false;
                }
            default:
                return String(value);
        }
    }

    static validate (req: Request) {
        super.validate(req);

        const toValidate = Object.assign(req.query, req.body, req.params)
        const v = toValidate.value;

        const expectedType = toValidate.type;
        const uncastedType = typeof v;
        
        if ( ! ['string', 'number', 'boolean'].includes(uncastedType) ) {
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
                break;
            default:
                // the rest are cast as strings and work no matter what
                break;
        }

        // Validated
        return;
    }
}