import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { GetInteractionCollection, GetInteractionsResult, InteractionNameType } from "../../../_common/types/interaction.type.js";
import { parseJson } from "../../_common/helpers/parseJson.js";
import { db } from "../databases/db.js";

const index: InteractionNameType[] = [
    "blocks",
    "chats",
    "dismisses",
    "follows",
    "friends",
    "hiddenCollaborations",
    "hides",
    "likes",
    "mutes",
    "reads",
    "restricts",
    "shares",
    "views"
];

type Props = {
    source?: string;
    target?: string;
    type?: InteractionNameType | InteractionNameType[];
    includeItems?: boolean;
    getAs?: string;
};

export default function getInteractionsService({
    source,
    target,
    type,
    includeItems = false,
    getAs
}: Props): GetInteractionCollection {
    const targetTypes: InteractionNameType[] = Array.isArray(type) 
        ? type 
        : type 
            ? [type] 
            : index;

    const selectParams: unknown[] = [];

    const buildInteractionField = (table: InteractionNameType) => {
        const conditions = [];
        const conditionParams = [];

        if (target != null) {
            conditions.push("target = ?");
            conditionParams.push(target);
        }

        if (source != null) {
            conditions.push("source = ?");
            conditionParams.push(source);
        }

        const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        let itemsSql = "";
        if (includeItems) {
            selectParams.push(...conditionParams);
            itemsSql = `'items', COALESCE((SELECT json_group_array(json_object('source', source, 'target', target, 'date', date)) FROM ${table} ${whereSql}), json('[]')),`;
        }

        selectParams.push(...conditionParams);

        selectParams.push(...conditionParams);

        selectParams.push(getAs ?? null, getAs ?? null);
        if (target != null) {
            selectParams.push(target);
        }

        return `
            '${table}', json_object(
                ${itemsSql}
                'latestDate', (SELECT MAX(date) FROM ${table} ${whereSql}),
                'count', (SELECT COUNT(*) FROM ${table} ${whereSql}),
                'hasInteracted', CASE WHEN ? IS NOT NULL AND EXISTS (SELECT 1 FROM ${table} WHERE source = ? ${target != null ? "AND target = ?" : ""}) THEN json('true') ELSE json('false') END
            )
        `;
    };

    const interactionFieldsSql = targetTypes
        .map(t => buildInteractionField(t))
        .join(",\n");

    const result = db.interactions.query<{ interactions: string }>(
        `
            SELECT 
                json_object(
                    ${interactionFieldsSql}
                ) AS interactions
        `,
        selectParams
    );

    assertDbSuccess(result);

    const rawInteractions = result.rows[0]?.interactions;
    if (!rawInteractions) return {};

    const parsedRows = Object.fromEntries(
        Object.entries(
            parseJson(rawInteractions) as GetInteractionsResult[]
        ).map(([key, value]) => {
            return [
                key,
                {
                    items: parseJson(value.items) ?? [],
                    count: value.count,
                    latestDate: value.latestDate ?? null,
                    hasInteracted: value.hasInteracted,
                }
            ];
        })
    );

    return parsedRows;
}
