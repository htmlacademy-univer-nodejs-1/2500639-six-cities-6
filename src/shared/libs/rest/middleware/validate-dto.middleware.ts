import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Middleware } from '../index.js';
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';

export class ValidateDtoMiddleware implements Middleware {
  constructor(private dto: ClassConstructor<object>) {}

  public async execute({body}: Request, res: Response, next: NextFunction): Promise<void> {
    const dtoInstans = plainToInstance(this.dto, body);
    const errors = await validate(dtoInstans, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).send(errors);
      return;
    }

    next();
  }
}
