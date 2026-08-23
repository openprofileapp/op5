import { AdvancedError } from "kage-library";

import { db } from "../databases/db.js";

import { 
    InteractionType, 
    GetSourceInteractionType, 
    GetTargetInteractionType, 
    InteractionCollection,
    TransformedRow,
    InteractionNameType,
    InteractionMethod
} from "../../../_common/types/interaction.type.js";

import { buildSqlInClause } from "../../../_common/helpers/sql.js";
import { formatCountOnly } from "../helpers/formatCountOnly.js";

const index: InteractionNameType[] = [
    "blocks",
    "follows",
    "friends",
    "likes",
    "mutes",
    "reads",
    "restricts",
    "shares",
    "views"
];

type BaseOptions = {
    method?: InteractionMethod;
    checkSourceInteraction?: string | string[];
    countOnly?: boolean;
};

type InteractionOptionsString = BaseOptions & {
    type?: InteractionNameType;
    types?: InteractionNameType;
};

type InteractionOptionsArray = BaseOptions & {
    types?: InteractionNameType[];
};

type InteractionOptions = InteractionOptionsString | InteractionOptionsArray;

type MultiTypeResult = Partial<Record<InteractionNameType, InteractionCollection>>;

export default function getInteractionsById(
    id: string,
    options?: InteractionOptionsString
): InteractionCollection;

export default function getInteractionsById(
    id: string,
    options?: InteractionOptionsArray
): MultiTypeResult;

export default function getInteractionsById(
    ids: string[],
    options?: InteractionOptionsString
): Record<string, InteractionCollection>;

export default function getInteractionsById(
    ids: string[],
    options?: InteractionOptionsArray
): Record<string, MultiTypeResult>;

export default function getInteractionsById(
    ids: string | string[],
    options?: InteractionOptions
): InteractionCollection | MultiTypeResult | Record<string, InteractionCollection> | Record<string, MultiTypeResult> {
    const isArray = Array.isArray(ids);
    const array = isArray ? ids : [ids];

    const method = options?.method;
    const countOnly = options?.countOnly ?? false;
    
    const rawTypes = options?.types ?? (options as InteractionOptionsString)?.type;
    const isMultiTypes = !rawTypes || Array.isArray(rawTypes);

    const tables: InteractionNameType[] = rawTypes 
        ? (Array.isArray(rawTypes) ? rawTypes : [rawTypes]) 
        : index;

    const rawCheck = options?.checkSourceInteraction;

    const checkTargetsSet = rawCheck 
        ? new Set(Array.isArray(rawCheck) ? rawCheck : [rawCheck])
        : null;

    if (array.length === 0) {
        if (isArray) return {};
        return formatCountOnly(
            isMultiTypes ? {} 
            : { items: [], count: 0, ...(
                checkTargetsSet ? { hasInteracted: false } : {}
            ) }, countOnly
        );
    }

    let queryString = "";
    let queryParams = [];

    if (method) {
        const clauseInfo = buildSqlInClause(method, array);

        const queries = tables.map((table) => 
            `SELECT source, target, date, '${table}' as type FROM ${table} WHERE ${clauseInfo.clause}`
        );

        queryString = queries.join(" UNION ALL ");
        queryParams = tables.flatMap(() => clauseInfo.params);
    } else {
        const sourceClause = buildSqlInClause("source", array);
        const targetClause = buildSqlInClause("target", array);

        const combinedClause = `(${sourceClause.clause} OR ${targetClause.clause})`;
        const combinedParams = [...sourceClause.params, ...targetClause.params];

        const queries = tables.map((table) => 
            `SELECT source, target, date, '${table}' as type FROM ${table} WHERE ${combinedClause}`
        );

        queryString = queries.join(" UNION ALL ");
        queryParams = tables.flatMap(() => combinedParams);
    }

    const result = db.interactions.query<InteractionType & { type: InteractionNameType }>(
        queryString, 
        queryParams
    );

    if (!result.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while fetching interactions",
            details: result.error
        });
    }

    const transformRow = (row: InteractionType): TransformedRow => {
        if (method === "source") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { source, ...rest } = row;

            return rest as GetSourceInteractionType;
        } else if (method === "target") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { target, ...rest } = row;

            return rest as GetTargetInteractionType;
        }

        return row;
    };

    const isCheckMatch = (row: InteractionType): boolean => {
        return checkTargetsSet ? checkTargetsSet.has(row.source) : false;
    };

    const createEmptyCollection = (): InteractionCollection => ({
        items: [],
        count: 0,
        
        ...(checkTargetsSet ? { hasInteracted: false } : {})
    });

    const createEmptyMultiTypeResult = (): MultiTypeResult => {
        const map: MultiTypeResult = {};

        for (const table of tables) {
            map[table] = createEmptyCollection();
        }

        return map;
    };

    if (!isArray) {
        if (isMultiTypes) {
            const map = createEmptyMultiTypeResult();

            for (const row of result.rows) {
                const { type, ...rest } = row;
                const collection = map[type];

                if (collection) {
                    collection.items?.push(transformRow(rest));
                    collection.count++;

                    if (isCheckMatch(row)) {
                        collection.hasInteracted = true;
                    }
                }
            }
            return formatCountOnly(map, countOnly);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const transformedItems = result.rows.map(({ type, ...rest }) => transformRow(rest));
        const hasInteracted = checkTargetsSet ? result.rows.some((row) => isCheckMatch(row)) : undefined;

        return formatCountOnly({
            items: transformedItems,
            count: transformedItems.length,

            ...(hasInteracted !== undefined ? { hasInteracted } : {}), countOnly
        }, countOnly);
    }

    if (isMultiTypes) {
        const multiData: Record<string, MultiTypeResult> = {};

        for (const id of array) {
            multiData[id] = createEmptyMultiTypeResult();
        }

        for (const row of result.rows) {
            const { type, ...rest } = row;
            const transformed = transformRow(rest);

            for (const id of array) {
                const matchesSource = method === "source" && row.source === id;
                const matchesTarget = method === "target" && row.target === id;
                const matchesBoth = !method && (row.source === id || row.target === id);

                if (matchesSource || matchesTarget || matchesBoth) {
                    const collection = multiData[id][type];

                    if (collection) {
                        collection.items?.push(transformed);
                        collection.count++;

                        if (isCheckMatch(row)) {
                            collection.hasInteracted = true;
                        }
                    }
                }
            }
        }

        return formatCountOnly(multiData, countOnly);
    }

    const singleData: Record<string, InteractionCollection> = {};

    for (const id of array) {
        singleData[id] = createEmptyCollection();
    }

    for (const row of result.rows) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type, ...rest } = row;
        const transformed = transformRow(rest);

        for (const id of array) {
            const matchesSource = method === "source" && row.source === id;
            const matchesTarget = method === "target" && row.target === id;
            const matchesBoth = !method && (row.source === id || row.target === id);

            if (matchesSource || matchesTarget || matchesBoth) {
                const collection = singleData[id];
                collection.items?.push(transformed);
                collection.count++;

                if (isCheckMatch(row)) {
                    singleData[id].hasInteracted = true;
                }
            }
        }
    }

    return formatCountOnly(singleData, countOnly);
}
