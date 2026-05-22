import { ClassConstructor, plainToInstance } from 'class-transformer';
import { HttpError } from '../libs/rest/index.js';
import { StatusCodes } from 'http-status-codes';
import type { RequestWithTokenPayload } from '../modules/auth/index.js';

export function generateRandomValue(min: number, max: number, numAfterDigit = 0): number {
  return +((Math.random() * (max - min)) + min).toFixed(numAfterDigit);
}

export function getRandomItems<T>(items: T[]): T[] {
  const startPosition = generateRandomValue(0, items.length - 1);
  const endPosition = generateRandomValue(startPosition, items.length);
  return items.slice(startPosition, endPosition);
}

export function getRandomItem<T>(items: T[]): T {
  return items[generateRandomValue(0, items.length - 1)];
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

export function fillDTO<T, V>(someDto: ClassConstructor<T>, plainObject: V) {
  return plainToInstance(someDto, plainObject, {excludeExtraneousValues: true});
}

export function createErrorObject(message: string) {
  return {
    error: message,
  };
}

export function getUserId(req: unknown, controllerName: string): string {
  const userId = (req as RequestWithTokenPayload | null | undefined)?.tokenPayload?.id;

  if (!userId) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Unauthorized user',
      controllerName,
    );
  }

  return userId;
}
