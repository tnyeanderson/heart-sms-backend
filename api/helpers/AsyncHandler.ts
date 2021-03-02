import { Request, Response, NextFunction, Handler } from "express";

/**
 * Create async-aware middleware.
 * 
 * @example
 * router.route('/add').post(asyncHandler(async (req, res, next) => { doStuff() })) 
 * 
 * @param fn async-aware middleware function
 */
export function asyncHandler (fn: Handler) {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise
        .resolve(fn(req, res, next))
        .catch(next)
}