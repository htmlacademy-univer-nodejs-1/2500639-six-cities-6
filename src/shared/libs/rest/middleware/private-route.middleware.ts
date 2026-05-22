import { Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../errors/http-error.js';
import type { RequestWithTokenPayload } from '../../../modules/auth/index.js';

export class PrivateRouteMiddleware implements Middleware {
  public async execute({tokenPayload}: RequestWithTokenPayload, _res: Response, next: NextFunction): Promise<void> {
    if(!tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'PrivateRouteMiddleware'
      );
    }

    return next();
  }
}
