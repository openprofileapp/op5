export const satisfiesAll = <T>() => <U extends T[]>(
    ...array: U & ([T] extends [U[number]] ? ([U[number]] extends [T] ? U : never) : never)
) => new Set<T>(array);
