import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';

export const errorsMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const boomError = Boom.isBoom(error) ? error : Boom.boomify(error);

  return res.status(boomError.output.statusCode).json({
    statusCode: boomError.output.statusCode,
    error: boomError.output.payload.error,
    message: boomError.message,
  });
};