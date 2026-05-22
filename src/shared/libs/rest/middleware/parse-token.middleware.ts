import { Response, NextFunction } from 'express';
import { Middleware } from './middleware.interface.js';
import { jwtVerify } from 'jose';
import { createSecretKey } from 'node:crypto';
import { HttpError } from '../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import type { RequestWithTokenPayload, TokenPayload } from '../../../modules/auth/index.js';

function isTokenPayload(payload: unknown): payload is TokenPayload {
  return (
    (typeof payload === 'object' && payload !== null) &&
    ('email' in payload && typeof payload.email === 'string') &&
    ('name' in payload && typeof payload.name === 'string') &&
    ('id' in payload && typeof payload.id === 'string')
  );
}

export class ParseTokenMiddleware implements Middleware {
  constructor(private readonly jwtSecret: string) {}

  public async execute(req: RequestWithTokenPayload, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;
    if(!authorizationHeader) {
      return next();
    }

    const [schema, token] = authorizationHeader.split(' ');

    if(schema !== 'Bearer' || !token) {
      return next(new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid token',
        'AuthenticateMiddleware'
      ));
    }

    try{
      const {payload} = await jwtVerify(token, createSecretKey(this.jwtSecret, 'utf-8'));

      if(isTokenPayload(payload)) {
        req.tokenPayload = {...payload};
        return next();
      }

      return next(new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid token',
        'AuthenticateMiddleware'
      ));
    } catch {
      return next(new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid token',
        'AuthenticateMiddleware'
      ));
    }
  }
}
