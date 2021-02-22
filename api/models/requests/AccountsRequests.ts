import { Expose } from "class-transformer";
import { NextFunction, Request, Response } from "express";
import db from '../../db/query.js';
import users from '../../helpers/UserHelper.js';
import { DuplicateUserError, UserNotAllowedError } from "../responses/ErrorResponses.js";
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
    @Expose() value: any = {};
}