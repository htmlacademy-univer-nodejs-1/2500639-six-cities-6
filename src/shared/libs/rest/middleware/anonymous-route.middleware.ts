import { Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { HttpError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';
import type { RequestWithTokenPayload } from '../../../modules/auth/index.js';

export class AnonymousRouteMiddleware implements Middleware {
  public async execute({tokenPayload}: RequestWithTokenPayload, _res: Response, next: NextFunction): Promise<void> {
    if(tokenPayload) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'This route is available only for anonymous users',
        'AnonymousRouteMiddleware'
      );
    }

    return next();
  }
}
