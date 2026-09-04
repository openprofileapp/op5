import { PlatformPermissionNameType } from "./permissions.type.js";

export type ExperimentsNameType = 
    | "ALL"
    | "QUICK_ACTIONS_BAR"
;

export type ExperimentResultType = {
    value: string;
    array: ExperimentsNameType[];
    name: string;
    description: string;
    togglePermissionRequirement: PlatformPermissionNameType;
    isActive: boolean;
    addedDate: string;
}
