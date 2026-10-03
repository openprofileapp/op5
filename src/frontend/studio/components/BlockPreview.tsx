/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import { BlockItemType } from "../../../_common/types/blocks/block.type.js";
import { GetRowItemType } from "../../../_common/types/blocks/row.type.js";
import { apiBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { toast } from "../../_common/scripts/toast.js";
import {
    GetFieldItemType,
    FieldItemType
} from "../../../_common/types/blocks/field.type.js";
import { GetValueType } from "../../../_common/types/blocks/value.type.js";
import TemplateField from "../components/TemplateField.js";

interface Props {
    blockId: string;
    className?: string;
}

export default function BlockPreview({ 
    blockId,
    className
}: Props) {
    const { ready: isTranslationReady } = useTranslation();

    const [block, setBlock] = useState<BlockItemType>();
    const [blockData, setBlockData] = useState<GetRowItemType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const valuesMapRef = useRef<{ [fieldId: string]: string }>({});

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/blocks/drafts?id=${blockId}`,
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok || !data?.items?.[0]) {
                    return;
                }

                setBlock(data.items[0]);
            } catch (err) {
                console.error(err);
            }
        };

        if (blockId) {
            fetchBlock();
        }
    }, [blockId]);

    useEffect(() => {
        const fetchBlockData = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/blocks/drafts/${blockId}/data`,
                    { credentials: "include" }
                );

                const json = await response.json();

                if (!response.ok) {
                    toast.show("Failed to load block", {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    });

                    return;
                }

                setBlockData(json || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (blockId) {
            fetchBlockData();
        }
    }, [blockId]);

    useEffect(() => {
        if (!Array.isArray(blockData)) return;

        valuesMapRef.current = {};

        blockData.forEach((row) => {
            // @ts-ignore
            row.fields?.items?.forEach((field: GetFieldItemType) => {
                if (
                    field.fieldId &&
                    field.value?.content !== undefined
                ) {
                    valuesMapRef.current[field.fieldId] =
                        String(field.value.content);
                }
            });
        });
    }, [blockData]);

    const pluralize = (value: string): string => {
        const trimmed = value.trim();

        if (!trimmed) return value;

        if (/(s|x|z|ch|sh)$/i.test(trimmed)) {
            if (/ss$/i.test(trimmed)) {
                return `${trimmed}es`;
            }

            return trimmed.endsWith("s")
                ? trimmed
                : `${trimmed}es`;
        }

        if (/[^aeiou]y$/i.test(trimmed)) {
            return `${trimmed.slice(0, -1)}ies`;
        }

        if (/(?:f|fe)$/i.test(trimmed)) {
            if (/(?:roof|chief|belief|chef)$/i.test(trimmed)) {
                return `${trimmed}s`;
            }

            return trimmed.replace(/fe?$/i, "ves");
        }

        return `${trimmed}s`;
    };

    const resolveDynamicValues = useCallback(
        (fieldIdOrExpression: string | undefined): string => {
            if (!fieldIdOrExpression) return "";

            const getFieldValue = (
                id: string
            ): {
                field: GetFieldItemType;
                text: string;
            } | undefined => {
                for (const row of blockData || []) {
                    // @ts-ignore
                    for (const field of row.fields?.items || []) {
                        if (field.fieldId === id) {
                            if (field.type?.toLowerCase() === "button") {
                                let options = field.options;

                                if (typeof options === "string") {
                                    try {
                                        options = JSON.parse(options);
                                    } catch {
                                        options = {};
                                    }
                                }

                                return {
                                    field,
                                    text: options?.text || ""
                                };
                            }

                            return {
                                field,
                                text: field.value?.content ?? ""
                            };
                        }
                    }
                }

                return undefined;
            };

            const target = getFieldValue(fieldIdOrExpression);
            const textToResolve = target
                ? target.text
                : fieldIdOrExpression;

            if (!textToResolve) return "";

            return String(textToResolve).replace(
                /\{([^}]+)\}/g,
                (match, expression) => {
                    const parts = expression
                        .split(".")
                        .map((part: string) => part.trim())
                        .filter(Boolean);

                    const refFieldId = parts.shift();

                    if (!refFieldId) return match;

                    let result: string;

                    const refTarget = getFieldValue(refFieldId);

                    if (!refTarget) {
                        return match;
                    }

                    result = String(refTarget.text);

                    for (const operation of parts) {
                        switch (operation.toLowerCase()) {
                            case "possessive":
                                if (
                                    result.endsWith("s") ||
                                    result.endsWith("S")
                                ) {
                                    result += "'";
                                } else {
                                    result += "'s";
                                }
                                break;

                            case "pluralize":
                                result = pluralize(result);
                                break;

                            case "lowercase":
                                result = result.toLowerCase();
                                break;

                            case "uppercase":
                                result = result.toUpperCase();
                                break;

                            case "titlecase":
                                result = result
                                    .toLowerCase()
                                    .replace(
                                        /\b\w/g,
                                        (char) => char.toUpperCase()
                                    );
                                break;

                            case "capitalize":
                                result =
                                    result.charAt(0).toUpperCase() +
                                    result.slice(1);
                                break;

                            default:
                                break;
                        }
                    }

                    return result;
                }
            );
        },
        [blockData]
    );

    const scrollToField = useCallback((fieldId: string) => {
        if (!fieldId) return;

        setTimeout(() => {
            const element = document.getElementById(`field-${fieldId}`);

            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }, 150);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "");

            if (hash) {
                scrollToField(hash);
            }
        };

        window.addEventListener("hashchange", handleHashChange);

        if (window.location.hash) {
            scrollToField(
                window.location.hash.replace("#", "")
            );
        }

        return () => {
            window.removeEventListener(
                "hashchange",
                handleHashChange
            );
        };
    }, [isLoading, scrollToField]);

    if (!isTranslationReady) return null;

    return (
        <div className={`${className} flex flex-col items-center p-4 w-full`}>
            <div className="bg-base-100 border border-base-300 p-4 rounded-lg w-full max-w-5xl">
                <div className="p-2 md:p-4">
                    <div className="flex flex-col gap-1">
                        {blockData.map((row) => {
                            // @ts-ignore
                            const visibleFields = row.fields?.items || [];

                            return (
                                <div
                                    // @ts-ignore
                                    key={row.rowId}
                                    className="min-h-16 flex gap-3"
                                >
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                            {visibleFields.map(
                                                (
                                                    field: GetFieldItemType
                                                ) => {
                                                    const rawContent =
                                                        field.value
                                                            ?.content || "";

                                                    const resolvedLabel =
                                                        resolveDynamicValues(
                                                            field.label
                                                        );

                                                    const resolvedPlaceholder =
                                                        resolveDynamicValues(
                                                            field.placeholder
                                                        );

                                                    const resolvedGuide =
                                                        resolveDynamicValues(
                                                            field.guide
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                field.fieldId
                                                            }
                                                            className={`flex-${field.flex || 1} min-w-0`}
                                                        >
                                                            <TemplateField
                                                                    id={field.fieldId}
                                                                    type={field.type}
                                                                    label={resolvedLabel}
                                                                    placeholder={resolvedPlaceholder}
                                                                    guide={resolvedGuide}
                                                                    // @ts-ignore
                                                                    value={{
                                                                        ...field.value as GetValueType,
                                                                        content: rawContent,
                                                                    }}
                                                                    options={field.options}
                                                                    isLocked={field.isLocked}
                                                                    url={`${studioBaseUrl}/block/${blockId}`}
                                                                    assetId={blockId as string}
                                                                    // @ts-ignore
                                                                    rowId={row.rowId}
                                                                    // @ts-ignore
                                                                    data={field as FieldItemType}
                                                                    resolveDynamicValues={resolveDynamicValues}
                                                                    isBlockAsset={true}
                                                                    noContextMenu={true}
                                                                    readOnly={true}
                                                                />
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
