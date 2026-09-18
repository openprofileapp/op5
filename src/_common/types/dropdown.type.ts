export type DropdownOptionValue = string | number;

export type DropdownOptionItem =
    | DropdownOptionValue
    | { id: DropdownOptionValue; name: string; category?: string };

export type DropdownOptionsType =
    | DropdownOptionItem[]
    | Record<string, string>
    | Record<string, DropdownOptionItem[]>
    | Record<string, string>[];
