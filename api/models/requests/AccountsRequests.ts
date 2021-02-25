import { Expose } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import users from '../../helpers/UserHelper.js';
import { BaseError } from "../errors/Errors.js";
import { DuplicateUserError, ErrorResponse, MissingParamError, ParamTypeError, UserNotAllowedError } from "../responses/ErrorResponses.js";
import { AccountIdRequest, BaseRequest } from "./BaseRequests.js";


/**
 * accounts/signup
 */
export class SignupRequest extends BaseRequest {
    // Body
    @Expose() name: string = '';
	@Expose() password: string = '';
	@Expose() phone_number: string = '';
	@Expose() real_name: string = '';

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
     * Express middleware that responds with an error if the user is a duplicate
     * @param req 
     * @param res 
     * @param next 
     */
    static checkDuplicateUser (req: Request, res: Response, next: NextFunction) {
        // res.locals.request is set from .handler()
        let r = res.locals.request;
        let validate_username = `SELECT username FROM Accounts WHERE username = ${db.escape(r.name)}`;
    
        // Don't do the work to hash the password if the user already exists
        db.query(validate_username, res, function (result) {
            if (result[0] && result[0].username === r.name) {
                // User exists
                return next(new DuplicateUserError);
            } else {
                // Continue to signup
                return next();
            }
        });
    }
}


/**
 * accounts/login
 */
export class LoginRequest extends BaseRequest {
    // Body
    @Expose() username: string = '';
	@Expose() password: string = '';
}


/**
 * accounts/dismissed_notification
 */
export class DismissedNotificationRequest extends AccountIdRequest {
    // Query
    @Expose() id: string = '';
	@Expose() device_id: string = '';

    static optional = ['device_id'];
}


/**
 * accounts/update_setting
 */
export class UpdateSettingRequest extends AccountIdRequest {
    // Query
    @Expose() pref: string = '';
	@Expose() type: string = '';
    @Expose() value: any = undefined;

    static validate (req: Request) {
        let validated = super.validate(req);

        let toValidate = Object.assign(req.query, req.body, req.params)
        let v = toValidate.value;

        let expectedType = toValidate.type;
        let uncastedType = typeof v;
        

        if (validated instanceof ErrorResponse) {
            // Super did not validate. Return its error
            return validated;
        }

        switch (uncastedType) {
            case 'string': // Should always be a string because it's in the query, but it might not be
            case 'number':
            case 'boolean':
                // Allowed
                break;
            default:
                // Other types are not allowed
                return new ParamTypeError('value');
        }

        // Can it cast?
        switch (expectedType) {
            case 'int':
            case 'long':
                if (isNaN(Number(v))) {
                    return new ParamTypeError('value');
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
                    return new ParamTypeError('value')
                }
            default:
                // the rest are cast as strings and work no matter what
                break;
        }

        // Validated
        return true;
    }
}