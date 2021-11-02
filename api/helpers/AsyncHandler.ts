import { Request, Response, NextFunction, Handler } from "express";

// https://www.acuriousanimal.com/blog/2018/03/15/express-async-middleware

/**
 * Create async-aware middleware.
 * 
 * @example
 * router.route('/add').post(asyncHandler(async (req, res, next) => { await doStuff() })) 
 * 
 * @param fn async-aware middleware function
 */
export function asyncHandler (fn: Handler) {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise
        .resolve(fn(req, res, next))
        .catch(next)
}