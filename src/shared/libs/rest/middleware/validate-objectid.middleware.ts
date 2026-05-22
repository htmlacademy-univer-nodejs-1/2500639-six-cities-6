import { Request, Response, NextFunction } from 'express';
import { HttpError, Middleware } from '../index.js';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';

export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private readonly param: string) {}

  public async execute({ params }: Request, _res: Response, next: NextFunction): Promise<void> {
    const paramValue = params[this.param];
    const objectId = Array.isArray(paramValue) ? paramValue[0] : paramValue;

    if(objectId && Types.ObjectId.isValid(objectId)){
      return next();
    }

    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      `${objectId} is invalid ObjectID`,
      'ValidateObjectIdMiddleware'
    );
  }
}
