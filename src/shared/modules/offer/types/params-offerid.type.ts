import { ParamsDictionary } from 'express-serve-static-core';

export type OfferIdParam = {
  offerId: string;
} | ParamsDictionary;
