import type Express from 'express';

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// With credit to https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce
export function catchAsync(fn: Express.RequestHandler) {
    return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
          console.error(`catchAsync ERROR: ${err.message} ${err.stack}`);
          next(err);
      });
    };
}
