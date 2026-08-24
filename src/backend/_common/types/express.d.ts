import "express";

import { ValidSessionType } from "../../../_common/types/validSession.type.ts"

declare global {
    namespace Express {
        interface Request {
            session: ValidSessionType;
        }
    }
}
