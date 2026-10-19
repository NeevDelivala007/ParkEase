import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async route/controller handler so any rejected promise is
 * forwarded to Express's error middleware, instead of crashing the process
 * or being silently swallowed.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
