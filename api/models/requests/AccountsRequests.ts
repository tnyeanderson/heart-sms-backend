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

    static validate (req: Request) {
        if (req.body.name && !users.isAllowed(req.body.name)) {
            throw new UserNotAllowedError;
        }

        return super.validate(req);
    }

    static checkDuplicateUser (req: Request, res: Response, next: NextFunction) {
        let r = res.locals.request;
        let validate_username = `SELECT username FROM Accounts WHERE username = ${db.escape(r.name)}`;
    
        // Don't do the work to hash the password if the user already exists
        db.query(validate_username, res, function (result) {
            if (result[0] && result[0].username === r.name) {
                // User exists
                return next(new DuplicateUserError);
            } else {
                // Continue to signup
                next();
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