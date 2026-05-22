import { TokenPayload } from './shared/modules/auth/index.ts';

declare module 'express-serve-static-core' {
  export interface Request {
    tokenPayload?: TokenPayload;
  }
}
