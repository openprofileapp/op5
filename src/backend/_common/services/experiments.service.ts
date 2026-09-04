/* 
————————————————————————————————————————————————————————————————
EDITING EXISTING BIT VALUES OR REUSING THEM WILL BREAK THE 
EXPERIMENTS SERVICE AND CAUSE MAJOR DATA VULNERABILITIES
———————————————————————————————————————————————————————————————— 
*/

import { AdvancedError } from "kage-library";

import { assertNotNull } from "../../../_common/asserts/notNull.assert.js";
import { ExperimentResultType, ExperimentsNameType } from "../../../_common/types/experiment.type.js";
import { PlatformPermissionNameType } from "../../../_common/types/permissions.type.js";

export interface Experiment {
    bit: bigint;
    name: string;
    description: string;
    togglePermissionRequirement: PlatformPermissionNameType;
    isActive: boolean;
    addedDate: string;
}

const experiments = {
    ALL: {
        bit: 0n,
        name: "All Experiments",
        description: "Gives all active experiments.",
        togglePermissionRequirement: "ADMIN",
        isActive: true,
        addedDate: "2026-09-04T11:21:04"
    },
    QUICK_ACTIONS_BAR: {
        bit: 1n,
        name: "Quick Actions Bar",
        description: "Moves non-commitment buttons to a quick action bar at the top of context menus.",
        togglePermissionRequirement: "WRITE",
        isActive: true,
        addedDate: "2026-09-04T11:21:04"
    }
} as const satisfies Record<string, Experiment>;

/**
 * Handles encoding, decoding, checking, and updating experiment bitmasks.
 * Experiments are stored as bigint bit flags based on a central index map.
 */
export default class ExperimentsService {
    public static experiments = experiments;

    private static bit(experiment: ExperimentsNameType): bigint {
        const exp = this.experiments[experiment];
        if (!exp) {
            throw new AdvancedError({
                code: 404,
                message: `Experiment "${experiment}" not found`
            });
        }

        return 1n << exp.bit;
    }

    /**
     * Resolves an experiment key into its metadata and encoded value.
     *
     * @example
     * ExperimentsService.getExperiment("QUICK_ACTIONS_BAR");
     * {
     *     bit: 1n,
     *     name: "Quick Actions Bar",
     *     description: "Moves non-commitment buttons to a quick action bar at the top of context menus.",
     *     togglePermissionRequirement: "WRITE",
     *     isActive: true,
     *     addedDate: "2026-09-04T11:21:04"
     * }
     */
    public static decode(input: string): ExperimentsNameType[] {
        assertNotNull(input);

        if (!/^[0-9]+$/.test(input)) {
            assertNotNull(input);
        }

        const userExperiments = BigInt(input);

        // Check if the ALL bit flag is set
        const hasAllBit = (userExperiments & (1n << this.experiments.ALL.bit)) !== 0n;

        if (hasAllBit) {
            return Object.entries(this.experiments)
                .filter(([name, config]) => name !== "ALL" && config.isActive)
                .map(([name]) => name as ExperimentsNameType);
        }

        const result: ExperimentsNameType[] = [];

        for (const [name, config] of Object.entries(this.experiments)) {
            if (name !== "ALL" && (userExperiments & (1n << config.bit)) !== 0n) {
                result.push(name as ExperimentsNameType);
            }
        }

        return result;
    }

    /**
     * Encodes a list of experiments into a bigint string.
     *
     * @example
     * ExperimentsService.encode(["QUICK_ACTIONS_BAR"]); // "2"
     */
    public static encode(input: ExperimentsNameType[]): string {
        if (!input?.length) {
            assertNotNull(input);
        }

        let result = 0n;

        for (const experiment of new Set(input)) {
            result |= this.bit(experiment);
        }

        return result.toString();
    }

    /**
     * Checks whether an experiment value satisfies required experiments array.
     *
     * @example
     * ExperimentsService.has("2", ["QUICK_ACTIONS_BAR"]); // all (default)
     * ExperimentsService.has("2", ["QUICK_ACTIONS_BAR"], "any");
     */
    public static has(
        input: string,
        compare: ExperimentsNameType | ExperimentsNameType[],
        mode: "all" | "any" = "all"
    ): boolean {
        const decoded = this.decode(input);

        const targetExperiments = Array.isArray(compare)
            ? compare
            : [compare];

        return mode === "all"
            ? targetExperiments.every(experiment => decoded.includes(experiment))
            : targetExperiments.some(experiment => decoded.includes(experiment));
    }

    /**
     * Resolves an experiment key into its metadata and encoded value.
     */
    public static getExperiment(input: ExperimentsNameType): ExperimentResultType {
        const experiment = this.experiments[input];

        if (!experiment) {
            throw new AdvancedError({
                code: 404,
                message: `Experiment "${input}" not found`
            });
        }

        return {
            value: this.encode([input]),
            array: input === "ALL" ? this.decode(this.encode(["ALL"])) : [input],
            name: experiment.name,
            description: experiment.description,
            togglePermissionRequirement: experiment.togglePermissionRequirement,
            isActive: experiment.isActive,
            addedDate: experiment.addedDate
        };
    }

    /**
     * Adds or removes experiments from an existing experiment bitmask.
     *
     * @example
     * ExperimentsService.update("1", "QUICK_ACTIONS_BAR", true);
     * ExperimentsService.update("3", ["QUICK_ACTIONS_BAR"], false);
     */
    public static update(
        input: string | bigint,
        experiment: ExperimentsNameType | ExperimentsNameType[],
        add = true
    ): string {
        let experimentValue = BigInt(input);

        const targetExperiments = Array.isArray(experiment)
            ? experiment
            : [experiment];

        for (const exp of targetExperiments) {
            const bitValue = this.bit(exp);

            if (add) {
                experimentValue |= bitValue;
            } else {
                experimentValue &= ~bitValue;
            }
        }

        return experimentValue.toString();
    }
}
