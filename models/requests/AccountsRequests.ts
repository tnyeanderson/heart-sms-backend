import { Request, Response, NextFunction } from "express";
import { MissingParamError, UserNotAllowedError } from "../responses/ErrorResponses.js";
import { _BaseRequest } from "./BaseRequest.js";
import users from '../../helpers/UserHelper.js';
import { Expose } from "class-transformer";

export class SignupRequest extends _BaseRequest {
    @Expose() name: string = '';
	@Expose() password: string = '';
	@Expose() phone_number: string = '';
	@Expose() real_name: string = '';

    static validate (req: Request, res: Response) {

        if (req.body.name && !users.isAllowed(req.body.name)) {
            res.json(new UserNotAllowedError);
            return false;
        }

        return super.validate(req, res);
    }
}


export class LoginRequest extends _BaseRequest {
    @Expose() username: string = '';
	@Expose() password: string = '';
}


export class DismissedNotificationRequest extends _BaseRequest {
    @Expose() id: string = '';
	@Expose() device_id: string = '';

    static query = ['id', 'device_id'];
    static optional = ['device_id'];
}