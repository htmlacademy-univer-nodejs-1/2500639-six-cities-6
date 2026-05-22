import { StatusCodes } from 'http-status-codes';
import { BaseUserException } from './index.js';

export class UserNotFoundException extends BaseUserException {
  constructor() {
    super(StatusCodes.NOT_FOUND, 'User not found');
  }
}
