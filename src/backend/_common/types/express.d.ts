import "express";

import { ValidSessionType } from "./validSession.type.ts"

declare global {
    namespace Express {
        interface Request {
            session?: ValidSessionType;
        }
    }
}