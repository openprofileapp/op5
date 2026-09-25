import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { GetValueType } from "../../../_common/types/blocks/value.type.js";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";
import { SliderInput } from "../../_common/components/SliderInput.js";
import ColorInput from "../../_common/components/ColorInput.js";
import { RatingInput } from "../../_common/components/RatingInput.js";
import { GetTemplateValueType } from "../../../_common/types/template/value.type.js";
import { FieldNameType, FieldOptionsType } from "../../../_common/types/field.type.js";
import { apiBaseUrl, cdnBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { ValueOptionsType } from "../../../_common/types/value.type.js";
import ImageInput from "../../_common/components/ImageInput.js";
import { Link } from "react-router-dom";
import { toast } from "../../_common/scripts/toast.js";
import { DropdownOptionsType } from "../../../_common/types/dropdown.type.js";
import { TemplateFieldItemType } from "../../../_common/types/template/field.type.js";

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
    // notes?: GetNoteType | GetNoteType[] | string;
    // thoughts?: GetThoughtType | GetThoughtType[] | string;
    url: string;
    rowId: string;
    readOnly?: boolean;
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
}

export default function TemplateField({
    id,
    type,
    label,
    placeholder,
    guide,
    value,
    options,
    // notes,
    // thoughts,
    url,
    rowId,
    readOnly = false,
    isLocked = false,
    onChange,
    dragHandleProps,
    onFieldChange
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dataset, setDataset] = useState<DropdownOptionsType>([]);

    const [isLocking, setIsLocking] = useState<boolean>(false);

    /*const normalizeMetadataList = (
        target?: string | MetadataObject | (string | MetadataObject)[]
    ): MetadataObject[] => {
        if (!target) return [];
        const arr = Array.isArray(target) ? target : [target];
        return arr.map((item) =>
            typeof item === "object" && item !== null ? item : { text: String(item) }
        );
    };*/

    const getValueString = (
        target?: GetValueType | GetValueType[] | string
    ): string => {
        if (!target) return "";
        if (Array.isArray(target)) {
            return target[0]?.content ?? "";
        }
        if (typeof target === "object" && target !== null) {
            return target.content ?? "";
        }
        return String(target);
    };

    // const notesList = normalizeMetadataList(notes);
    // const thoughtsList = normalizeMetadataList(thoughts);
    const displayValue = getValueString(value);

    const [localValue, setLocalValue] = useState(displayValue);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(displayValue);
    }, [displayValue]);

    useEffect(() => {
        if (isContextMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isContextMenuOpen]);

    const closeContextMenu = useCallback(() => {
        setIsContextMenuOpen(false);
        document.getElementById(`context-field-${id}`)?.hidePopover();
    }, [id]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsContextMenuOpen(true);

        const popover = document.getElementById(
            `context-field-${id}`
        ) as HTMLElement | null;

        if (!popover) return;

        popover.showPopover();

        requestAnimationFrame(() => {
            const rect = popover.getBoundingClientRect();

            popover.style.left = `${Math.min(
                e.clientX,
                window.innerWidth - rect.width - 8
            )}px`;

            popover.style.top = `${Math.min(
                e.clientY,
                window.innerHeight - rect.height - 8
            )}px`;
        });
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`context-field-${id}`);

            if (!menu) return;

            if (menu.contains(e.target as Node)) {
                return;
            }

            closeContextMenu();
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [id, closeContextMenu]);

    useEffect(() => {
       if (type !== "dropdown" || !options?.dataset) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(false);
            
            return;
        };

        async function fetchDataset() {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates/datasets?id=${options?.dataset}`,
                    { credentials: "include" }
                );

                const responseData = await response.json();

                if (!response.ok) {
                    toast.show(
                        `Failed to fetch dataset`, 
                        { 
                            subtext: `${responseData?.id || ""}${responseData?.id ? ": " : ""}${responseData?.message}`,
                            type: "error" 
                        }
                    );
                } else {
                    setDataset(JSON.parse(responseData.items?.[0].data) || []);
                }
            } catch (error) {
                toast.show(
                        `Failed to fetch dataset`, 
                        { 
                            subtext: error as string,
                            type: "error" 
                        }
                    );
            } finally {
                setIsLoading(false);
            }
        }

        fetchDataset();
    }, [type, options?.dataset]);

    const renderInputContent = () => {
        switch (type) {
            case "media": {
                const isFullUrlOrBase64 = 
                    localValue?.startsWith("data:") || 
                    localValue?.startsWith("http://") || 
                    localValue?.startsWith("https://") ||
                    localValue?.startsWith("blob:");

                const mediaUrl = localValue 
                    ? (isFullUrlOrBase64 ? localValue : `${cdnBaseUrl}${localValue}`)
                    : "";

                return (
                    <ImageInput
                        id={id}
                        value={null}
                        defaultUrl={mediaUrl}
                        options={value?.options as ValueOptionsType}
                        useModal={true}
                        readOnly={readOnly || isLocked}
                        className={`${mediaUrl ? "min-h-36 h-auto" : "min-h-36"} w-full`}
                        accept="image/png, image/jpeg, image/jpg"
                        onContextMenu={handleContextMenu}
                        onChange={async (file, base64Url, staticFile, staticBase64, updatedOptions) => {
                            setLocalValue(base64Url as string);

                            return await onChange(base64Url as string, updatedOptions);
                        }}
                    />
                );
            }

            case "button": {
                const url = localValue || `#${id}`;

                return (
                    <Link
                        to={url}
                        target={
                            (
                                url.includes(studioBaseUrl) ||
                                url.startsWith("#")
                            ) 
                                ? "" 
                                : "_blank"
                        }
                        className="btn btn-accent w-full min-h-10 h-10 flex items-center justify-center gap-2"
                        onContextMenu={handleContextMenu}
                    >
                        {url || value?.options?.title}

                        <span className="font-nerdfont leading-none">
                            
                        </span>
                    </Link>
                );
            }

            case "dropdown":
                return (
                    <TypeableDropdownInput
                        value={localValue}
                        options={dataset}
                        placeholder={placeholder || "Select or type..."}
                        largeText={true}
                        onChange={(value) => {
                            setLocalValue(value as string);
                            onChange?.(value as string);
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onContextMenu={handleContextMenu}
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

                const min = markValues.length > 0 ? markValues[0] : 0;
                const max = markValues.length > 0 ? markValues[markValues.length - 1] : 0;

                return (
                    <SliderInput
                        value={Number(localValue)}
                        min={min || 0}
                        max={max || 100}
                        marks={markValues}
                        valueFormat={valueRecord}
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(value) => {
                            setLocalValue(value as unknown as string)
                            onChange?.(value as unknown as string);
                        }}
                    />
                );
            }

            case "color":
                return (
                    <ColorInput 
                        value={localValue}
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(value) => {
                            setLocalValue(value)
                            onChange?.(value);
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

                const max = markValues.length > 0 ? markValues[markValues.length - 1] : 0;

                return (
                    <RatingInput
                        value={Number(localValue)}
                        icon={options?.icon}
                        maxRating={max || 5}
                        valueFormat={valueRecord}
                        readOnly={readOnly || isLocked}
                        onContextMenu={handleContextMenu}
                        onChange={(value) => {
                            setLocalValue(value as unknown as string)
                            onChange?.(value as unknown as string);
                        }}
                    />
                );
            }

            case "separator": {
                let element;

                switch (options?.separator) {
                    case "divider":
                        element = (
                            <div 
                                className="flex items-center justify-center w-full my-4 text-xs text-sub opacity-50"
                                onContextMenu={handleContextMenu}
                            >
                                {!readOnly && "This text is only visible during editing to display where the spacer is located"}
                            </div>
                        )
                        break;

                    case "header":
                        element = (
                            <div 
                                className="text-3xl my-4 w-full text-center font-semibold"
                                onContextMenu={handleContextMenu}
                            >
                                {localValue}
                            </div>
                        )
                        break;
                
                    case "spacer":
                    default:
                        element = (
                            <div 
                                className="flex items-center justify-center w-full my-4 text-xs text-sub opacity-50"
                                onContextMenu={handleContextMenu}
                            >
                                {!readOnly && "This text is only visible during editing to display where the spacer is located"}
                            </div>
                        )
                        break;
                }
                
                return element
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
                            setLocalValue(e.target.value);
                            onChange?.(e.target.value);
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
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                        ref={(el) => {
                            if (el) {
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }
                        }}
                    />
                );
        }
    };

    if (!isTranslationReady) return null;

    return (
        <div className="flex gap-3 w-full">
            <ul
                className={`${readOnly ? "hidden" : ""} dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50`}
                popover="manual"
                id={`context-field-${id}`}
            >
                {!isLocked && (
                    <li>
                        <button 
                            className="flex items-center justify-between gap-4"
                            onClick={() => {
                                // Open the edit modal here
                            }}
                        >
                            Edit Field
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </button>
                    </li>
                )}

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={async () => {
                            closeContextMenu();

                            setIsLocking(true);

                            await onFieldChange(
                                rowId,
                                id,
                                {
                                    fieldId: id,
                                    isLocked: !isLocked
                                }
                            )

                            setIsLocking(false);
                        }}
                    >
                        {isLocked ? "Unlock" : "Lock"} Field
                        <span className={`${isLocking ? "loading" : ""} font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center`}>
                            {isLocked ? "" : ""}
                        </span>
                    </button>
                </li>

                <hr />

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={async () => {
                            closeContextMenu();

                            try {
                                await navigator.clipboard.writeText(
                                    `${url}#${id}`
                                );

                                toast.show(
                                    t("components.toasts.copiedLink"), 
                                    { type: "success" }
                                );
                            } catch {
                                toast.show(
                                    t("components.toasts.failedCopiedLink"), 
                                    { type: "error" }
                                );
                            }
                        }}
                    >
                        Copy Link
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={async () => {
                            closeContextMenu();

                            try {
                                await navigator.clipboard.writeText(id);

                                toast.show(
                                    t("components.toasts.copiedId"), 
                                    { type: "success" }
                                );
                            } catch {
                                toast.show(
                                    t("components.toasts.failedCopiedId"), 
                                    { type: "error" }
                                );
                            }
                        }}
                    >
                        Copy ID
                        <span className="font-nerdfont text-3xl flex h-6 w-4 leading-none items-center justify-center">
                            󰻾
                        </span>
                    </button>
                </li>
            </ul>

































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

                    {
                        type !== "button" 
                        && type !== "separator" 
                    && (
                        <span>{label}</span>
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

                {Boolean(guide) && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                            isFocused
                                ? "max-h-[500px] opacity-100 mt-2"
                                : "max-h-0 opacity-0 mt-0 pointer-events-none"
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <div className="bg-accent text-accent-content rounded px-3 py-2 text-sm leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ children, node }) => {
                                        const isFirstParagraph =
                                            node?.position?.start.line === 1;
                                        return (
                                            <p className={isFirstParagraph ? "" : "mt-2"}>
                                                {isFirstParagraph && (
                                                    <span className="font-nerdfont inline-block mr-2 text-base align-middle">
                                                        󰋼
                                                    </span>
                                                )}
                                                {children}
                                            </p>
                                        );
                                    },

                                    ul: ({ children, node }) => {
                                        const isFirstList =
                                            node?.position?.start.line === 1;
                                        return (
                                            <div className="my-1">
                                                {isFirstList && (
                                                    <span className="font-nerdfont inline-block mr-2 text-base align-middle">
                                                        󰋼
                                                    </span>
                                                )}
                                                <ul className="inline-block list-disc pl-5 my-0">
                                                    {children}
                                                </ul>
                                            </div>
                                        );
                                    },

                                    li: ({ children }) => (
                                        <li className="my-0">{children}</li>
                                    ),

                                    a: ({ children, ...props }) => (
                                        <span>
                                            <span className="font-nerdfont inline-block mx-1 text-sm align-middle">
                                                
                                            </span>
                                            <a
                                                {...props}
                                                className="font-bold hover:underline inline-block"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {children}
                                            </a>
                                        </span>
                                    ),
                                }}
                            >
                                {guide}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </fieldset>
        </div>
    );
}
