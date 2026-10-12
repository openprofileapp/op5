import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { URL } from "kage-library/client";

import { GetValueType } from "../../../_common/types/blocks/value.type.js";
import { TypeableDropdownInput } from "./TypeableDropdownInput.js";
import { SliderInput } from "./SliderInput.js";
import ColorInput from "./ColorInput.js";
import { RatingInput } from "./RatingInput.js";
import { GetTemplateValueType } from "../../../_common/types/template/value.type.js";
import { FieldNameType, FieldOptionsType } from "../../../_common/types/field.type.js";
import { apiBaseUrl, cdnBaseUrl, studioBaseUrl } from "../scripts/domains.js";
import { ValueOptionsType } from "../../../_common/types/value.type.js";
import ImageInput from "./ImageInput.js";
import { Link } from "react-router-dom";
import { DropdownOptionsType } from "../../../_common/types/dropdown.type.js";
import { TemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import TemplateContextMenu from "../../studio/components/TemplateContextMenu.js";
import MarkdownRenderer from "./markdown/Renderer.js";

export interface MetadataObject {
    author?: string;
    text?: string;
    date?: string;
    createdDate?: string;
    updatedDate?: string;
    position?: number;
    isPinned?: boolean;
}

interface Props {
    id: string;
    type: FieldNameType;
    label?: string;
    placeholder?: string;
    guide?: string;
    value?: GetTemplateValueType;
    options?: FieldOptionsType;
    url: string;
    assetId: string;
    rowId: string;
    readOnly?: boolean;
    data?: TemplateFieldItemType;
    isLocked?: boolean;

    onChange: (
        value: string | number,
        options?: ValueOptionsType
    ) => boolean | Promise<boolean>;

    dragHandleProps?: {
        className?: string;
        ref?: (element: HTMLElement | null) => void;
        [key: string]: unknown;
    };

    onFieldChange: (
        targetRowId: string,
        originalFieldId: string,
        incoming: Partial<TemplateFieldItemType>
    ) => boolean | Promise<boolean>;

    onDelete: (
        id: string,
        type: "field" | "row" | "block" | "category"
    ) => void;

    resolveDynamicValues: (text: string) => string;
    isBlockAsset: boolean;
    isCharacter: boolean;
    noContextMenu: boolean;
}

const getValueString = (
    target?: GetValueType | GetValueType[] | string
): string => {
    if (target == null) return "";

    if (Array.isArray(target)) {
        return String(target[0]?.content ?? "");
    }

    if (typeof target === "object") {
        return String(target.content ?? "");
    }

    return String(target);
};

export default function TemplateField({
    id,
    type,
    label,
    placeholder,
    guide,
    value,
    options,
    url,
    assetId,
    rowId,
    readOnly = false,
    isLocked = false,
    data,
    onChange,
    dragHandleProps,
    onFieldChange,
    onDelete,
    resolveDynamicValues,
    isBlockAsset = false,
    isCharacter = false,
    noContextMenu = false
}: Props) {
    const { ready: isTranslationReady } = useTranslation();

    const [isFocused, setIsFocused] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

    const [dataset, setDataset] = useState<DropdownOptionsType>([]);
    const [datasetCategories, setDatasetCategories] = useState<string[]>([]);

    const displayValue = getValueString(value);
    const [localValue, setLocalValue] = useState(displayValue);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(displayValue);
    }, [displayValue]);

    const handleContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();

            if (noContextMenu) return;

            const popover = document.getElementById(
                `context-${id}`
            ) as HTMLElement | null;

            if (!popover) return;

            popover.showPopover();

            requestAnimationFrame(() => {
                const rect = popover.getBoundingClientRect();

                popover.style.left = `${Math.max(
                    8,
                    Math.min(
                        e.clientX,
                        window.innerWidth - rect.width - 8
                    )
                )}px`;

                popover.style.top = `${Math.max(
                    8,
                    Math.min(
                        e.clientY,
                        window.innerHeight - rect.height - 8
                    )
                )}px`;
            });
        },
        [id, noContextMenu]
    );

    useEffect(() => {
        const datasetId = options?.dataset;

        if (
            !datasetId ||
            (type !== "dropdown" && type !== "text")
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDatasetCategories([]);
            setIsCategoriesLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchCategories = async () => {
            setIsCategoriesLoading(true);

            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates/datasets/categories/${encodeURIComponent(datasetId)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load dataset categories"
                    );
                }

                const responseData = await response.json();

                if (!controller.signal.aborted) {
                    setDatasetCategories(
                        Array.isArray(responseData?.array)
                            ? responseData.array
                            : []
                    );
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(
                        "Dataset categories error:",
                        error
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsCategoriesLoading(false);
                }
            }
        };

        fetchCategories();

        return () => controller.abort();
    }, [options?.dataset, type]);

    useEffect(() => {
        const datasetId = options?.dataset;

        if (type !== "dropdown" || !datasetId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const timeout = setTimeout(async () => {
            setIsLoading(true);

            try {
                const sources = [
                    `${apiBaseUrl}/v3/templates/datasets?id=${encodeURIComponent(datasetId)}&dq=${encodeURIComponent(localValue)}`,
                    `${apiBaseUrl}/v3/templates/datasets/drafts?id=${encodeURIComponent(datasetId)}&dq=${encodeURIComponent(localValue)}`
                ];

                let loadedDataset: DropdownOptionsType | null = null;

                for (const source of sources) {
                    const response = await fetch(source, {
                        credentials: "include",
                        signal: controller.signal
                    });

                    if (!response.ok) continue;

                    const responseData = await response.json();

                    if (!responseData?.items?.length) {
                        continue;
                    }

                    const rawData = responseData.items[0]?.data;

                    const parsedData =
                        typeof rawData === "string"
                            ? JSON.parse(rawData)
                            : rawData;

                    if (Array.isArray(parsedData)) {
                        loadedDataset = parsedData;
                        break;
                    }
                }

                if (
                    !controller.signal.aborted &&
                    loadedDataset !== null
                ) {
                    setDataset(loadedDataset);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(
                        "Dataset loading error:",
                        error
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 100);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [localValue, options?.dataset, type]);

    const updateValue = useCallback(
        (
            nextValue: string | number,
            valueOptions?: ValueOptionsType
        ) => {
            if (readOnly || isLocked) return;

            setLocalValue(String(nextValue));

            onChange?.(nextValue, valueOptions);
        },
        [onChange, readOnly, isLocked]
    );

    const renderInputContent = () => {
        switch (type) {
            case "media": {
                const isFullUrlOrBase64 =
                    localValue.startsWith("data:") ||
                    localValue.startsWith("http://") ||
                    localValue.startsWith("https://") ||
                    localValue.startsWith("blob:");

                const mediaUrl = localValue
                    ? isFullUrlOrBase64
                        ? localValue
                        : `${cdnBaseUrl}${localValue}`
                    : "";

                return (
                    <ImageInput
                        id={`field-${id}`}
                        value={null}
                        defaultUrl={mediaUrl}
                        options={value?.options as ValueOptionsType}
                        useModal={true}
                        readOnly={readOnly || isLocked}
                        className={`${
                            mediaUrl
                                ? "min-h-36 h-auto"
                                : "min-h-36"
                        } w-full`}
                        accept="image/png, image/jpeg, image/jpg"
                        onContextMenu={handleContextMenu}
                        onChange={async (
                            file,
                            base64Url,
                            staticFile,
                            staticBase64,
                            updatedOptions
                        ) => {
                            if (readOnly || isLocked) return false;

                            const nextValue = base64Url as string;

                            setLocalValue(nextValue);

                            return await onChange(
                                nextValue,
                                updatedOptions
                            );
                        }}
                    />
                );
            }

            case "button": {
                const buttonUrl = options?.text || `#${id}`;

                let urlText = buttonUrl;

                if (options?.text) {
                    try {
                        const urlData = new URL(options.text);

                        urlText = `${
                            urlData?.subdomain || ""
                        }${
                            urlData?.subdomain ? "." : ""
                        }${
                            urlData?.domain || ""
                        }`;
                    } catch {
                        urlText = options.text;
                    }
                }

                const isInternal =
                    buttonUrl.includes(studioBaseUrl) ||
                    buttonUrl.startsWith("#");

                const className =
                    "btn btn-accent w-full min-h-10 h-10 flex items-center justify-center gap-2";

                const content = (
                    <>
                        {label || urlText}

                        <span className="font-nerdfont leading-none">
                            
                        </span>
                    </>
                );

                if (noContextMenu) {
                    return (
                        <div
                            id={`field-${id}`}
                            className={className}
                            onContextMenu={handleContextMenu}
                        >
                            {content}
                        </div>
                    );
                }

                return (
                    <Link
                        id={`field-${id}`}
                        to={buttonUrl}
                        target={isInternal ? undefined : "_blank"}
                        rel={isInternal ? undefined : "noopener noreferrer"}
                        className={className}
                        onContextMenu={handleContextMenu}
                    >
                        {content}
                    </Link>
                );
            }

            case "dropdown":
                return (
                    <TypeableDropdownInput
                        id={`field-${id}`}
                        value={localValue}
                        options={dataset}
                        placeholder={
                            placeholder ||
                            "Type to filter dataset..."
                        }
                        largeText={true}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onChange={(selectedId, selectedName) => {
                            const nextValue = String(
                                selectedName ??
                                selectedId ??
                                ""
                            );

                            updateValue(nextValue);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onContextMenu={handleContextMenu}
                        isServerSideFiltering={true}
                        typeable={options?.typeable}
                        multiple={options?.multiselect}
                        readonly={readOnly || isLocked}
                        isLoading={isLoading}
                    />
                );

            case "slider": {
                const valueRecord = options?.valueFormat;

                const markValues = valueRecord
                    ? Object.keys(valueRecord)
                        .map(Number)
                        .filter(Number.isFinite)
                        .sort((a, b) => a - b)
                    : [];

                const min =
                    markValues.length > 0
                        ? markValues[0]
                        : 0;

                const max =
                    markValues.length > 0
                        ? markValues[markValues.length - 1]
                        : 100;

                return (
                    <SliderInput
                        id={`field-${id}`}
                        value={Number(localValue)}
                        min={min}
                        max={max}
                        marks={markValues}
                        valueFormat={valueRecord}
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(nextValue) => {
                            updateValue(nextValue);
                        }}
                    />
                );
            }

            case "color":
                return (
                    <ColorInput
                        id={`field-${id}`}
                        value={localValue}
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(nextValue) => {
                            updateValue(nextValue);
                        }}
                    />
                );

            case "rating": {
                const valueRecord = options?.valueFormat;

                const markValues = valueRecord
                    ? Object.keys(valueRecord)
                        .map(Number)
                        .filter(Number.isFinite)
                        .sort((a, b) => a - b)
                    : [];

                const max =
                    markValues.length > 0
                        ? markValues[markValues.length - 1]
                        : 5;

                return (
                    <RatingInput
                        id={`field-${id}`}
                        value={Number(localValue)}
                        icon={options?.icon}
                        maxRating={max}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        valueFormat={
                            valueRecord &&
                            Object.keys(valueRecord).length > 0
                                ? valueRecord
                                : null
                        }
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(nextValue) => {
                            updateValue(nextValue);
                        }}
                    />
                );
            }

            case "separator": {
                switch (options?.separator) {
                    case "divider":
                        return (
                            <div
                                className="divider text-base w-full"
                                id={`field-${id}`}
                                onContextMenu={handleContextMenu}
                            >
                                {options.text}
                            </div>
                        );

                    case "header":
                        return (
                            <div
                                className="text-3xl my-4 w-full text-center font-semibold"
                                id={`field-${id}`}
                                onContextMenu={handleContextMenu}
                            >
                                {options.text}
                            </div>
                        );

                    case "spacer":
                    default:
                        return (
                            <div
                                className="flex items-center justify-center w-full my-4 text-xs text-sub opacity-50"
                                id={`field-${id}`}
                                onContextMenu={handleContextMenu}
                            >
                                {!readOnly &&
                                    "This text is only visible during editing to display where the spacer is located"}
                            </div>
                        );
                }
            }

            case "text":
            default:
                return (
                    <textarea
                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base overflow-hidden z-2"
                        id={`field-${id}`}
                        value={localValue}
                        placeholder={placeholder}
                        rows={1}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                        readOnly={readOnly || isLocked}
                        onChange={(e) => {
                            updateValue(e.target.value);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onMouseDown={(e) => {
                            if (e.button === 2) {
                                e.preventDefault();
                            }
                        }}
                        onContextMenu={handleContextMenu}
                        onInput={(e) => {
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height =
                                `${e.currentTarget.scrollHeight}px`;
                        }}
                        ref={(el) => {
                            if (el) {
                                el.style.height = "auto";
                                el.style.height =
                                    `${el.scrollHeight}px`;
                            }
                        }}
                    />
                );
        }
    };

    if (!isTranslationReady) return null;

    return (
        <>
            <div className="flex gap-3 w-full">
                {!noContextMenu && (
                    <TemplateContextMenu
                        id={id}
                        type="field"
                        label={label}
                        url={url}
                        assetId={assetId}
                        rowId={rowId}
                        readOnly={readOnly}
                        data={{ field: data }}
                        isLocked={isLocked}
                        onChange={onFieldChange}
                        onValueChange={onChange}
                        onDelete={onDelete}
                        resolveDynamicValues={resolveDynamicValues}
                        isEditing={Boolean(dragHandleProps)}
                        isBlockAsset={isBlockAsset}
                        isCharacter={isCharacter}
                        isCategoriesLoading={isCategoriesLoading}
                        datasetCategories={datasetCategories}
                    />
                )}

                <fieldset className="fieldset w-full">
                    <legend className="fieldset-legend text-sm font-normal flex items-center gap-2">
                        {dragHandleProps && (
                            <span {...dragHandleProps}>
                                <button
                                    type="button"
                                    className="flex items-center justify-center w-4 rounded-full overflow-hidden cursor-grab active:cursor-grabbing"
                                >
                                    <span className="font-nerdfont leading-none text-2xl">
                                        󰇛
                                    </span>
                                </button>
                            </span>
                        )}

                        {type !== "button" &&
                            type !== "separator" && (
                                <span className="text-sub">
                                    {label}
                                </span>
                            )}

                        {Boolean(isLocked) && !readOnly && (
                            <span
                                className="tooltip tooltip-accent"
                                data-tip="Locked"
                            >
                                <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </span>
                        )}
                    </legend>

                    {renderInputContent()}
                </fieldset>
            </div>

            {Boolean(guide) && !readOnly && (
                <div
                    className={`relative left-0 top-0 overflow-hidden transition-all duration-300 ease-out ${
                        isFocused
                            ? "max-h-[500px] opacity-100 mt-2"
                            : "max-h-0 opacity-0 mt-0 pointer-events-none"
                    }`}
                    onMouseDown={(e) => {
                        e.preventDefault();
                    }}
                >
                    <div className="bg-accent text-accent-content rounded px-3 py-2 text-sm leading-relaxed">
                        <MarkdownRenderer content={guide} />
                    </div>
                </div>
            )}
        </>
    );
}
