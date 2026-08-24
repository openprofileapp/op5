import { AdvancedError } from "kage-library";

export function assertNotNull(targets: unknown | unknown[]): void {
    if (targets === null || targets === undefined) {
        throw new AdvancedError({
            code: 400,
            message: "Malformed request"
        });
    }

    if (Array.isArray(targets)) {
        targets.forEach((item, index) => {
            if (item === null || item === undefined) {
                throw new AdvancedError({
                    code: 400,
                    message: "Malformed request",
                    details: index
                });
            }
        });
    }
}
