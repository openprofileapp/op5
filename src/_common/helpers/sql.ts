/**
 * Builds a dynamic SQL "IN" clause and parameter list.
 * Supports single or multiple columns (joined by OR).
 * 
 * @param column Single column name or array of column names
 * @param values Single value or array of values
 * 
 * @example
 * // Single column with an array
 * buildSqlInClause("id", ["1", "2"]);
 * // => { clause: "id IN (?, ?)", params: ["1", "2"] }
 * 
 * @example
 * // Single column with a single value
 * buildSqlInClause("id", "1");
 * // => { clause: "id IN (?)", params: ["1"] }
 * 
 * @example
 * // Multiple columns with multiple values
 * buildSqlInClause(["id", "username", "usernameOld"], ["admin", "user123"]);
 * // => { 
 * //   clause: "(id IN (?, ?) OR username IN (?, ?) OR usernameOld IN (?, ?))", 
 * //   params: ["admin", "user123", "admin", "user123", "admin", "user123"] 
 * // }
 */
export function buildSqlInClause<T extends string | number>(
    column: string | string[], 
    values: T | T[]
): { clause: string; params: T[] } {
    const params = Array.isArray(values) ? values : [values];
    
    if (params.length === 0) {
        return { clause: "1=0", params: [] };
    }

    const placeholders = params.map(() => "?").join(", ");
    const columns = Array.isArray(column) ? column : [column];

    if (columns.length === 0) {
        return { clause: "1=0", params: [] };
    }

    if (columns.length === 1) {
        return {
            clause: `${columns[0]} IN (${placeholders})`,
            params
        };
    }

    const subClauses = columns.map((col) => `${col} IN (${placeholders})`);
    const clause = `(${subClauses.join(" OR ")})`;

    const fullParams = columns.flatMap(() => params);

    return {
        clause,
        params: fullParams
    };
}
