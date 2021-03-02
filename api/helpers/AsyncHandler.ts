import { Request, Response, NextFunction, Handler } from "express";

export function asyncHandler (fn: Handler) {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise
        .resolve(fn(req, res, next))
        .catch(next)
}