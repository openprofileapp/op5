type ChangesType = {
    new: object;
    old: object;
}

export type AuditType = {
    id: string;
    source: string;
    target: string;
    action: string;
    changes: ChangesType;
    origin: string;
    date: string;
}

export type AuditApiType = {
    type: string;
    source: string | object;
    target?: string | object;
    action: string;
    changes?: ChangesType;
    origin?: string;
}