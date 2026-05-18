import { ParamsDictionary } from 'express-serve-static-core';

export type UserIdParams = {
  userId: string;
} | ParamsDictionary;
