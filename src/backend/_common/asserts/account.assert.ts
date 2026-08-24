import { AdvancedError } from "kage-library";
import { ValidSessionType } from "../../../_common/types/validSession.type.js";

export function assertAccount(session: ValidSessionType): void {
    if (!session?.userId) {
        throw new AdvancedError({
            code: 403,
            message: "No account"
        })
    }
}
