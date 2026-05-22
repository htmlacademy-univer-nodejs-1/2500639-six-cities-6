import { StatusCodes } from 'http-status-codes';
import { BaseUserException } from './index.js';

export class UserPasswordIncorrectException extends BaseUserException {
  constructor() {
    super(StatusCodes.UNAUTHORIZED, 'Incorrect user name or password');
  }
}
