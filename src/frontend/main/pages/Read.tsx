/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import { GetTemplateCategoryItemType } from "../../../_common/types/template/category.type.js";
import { GetTemplateBlockItemType } from "../../../_common/types/template/block.type.js";
import { apiBaseUrl, cdnBaseUrl, mainBaseUrl } from "../../_common/scripts/domains.js";
import { toast } from "../../_common/scripts/toast.js";
import { GetTemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import TemplateField from "../../_common/components/TemplateField.js";
import { GetTemplateValueType } from "../../../_common/types/template/value.type.js";
import Metadata from "../../_common/components/Metadata.js";
import { CategoryIdType } from "../../../_common/scripts/categories.js";

function getCategoryIcon(types: CategoryIdType[]) {    
    const priorityOrder: CategoryIdType[] =
        [
            "identity",
            "astrology",
            "abilities",
            "physical",
            "personality",
            "choices",
            "preferences",
            "beliefs",
            "interactions",
            "emotional",
            "health",
            "relationships",
        ];

    const highestCategory =
        priorityOrder.find(
            (type) =>
                types?.includes(
                    type
                )
        );

    let icon = "";

    switch (highestCategory) {
        case "identity":
            icon = "";
            break;
        case "astrology":
            icon = "";
            break;
        case "abilities":
            icon = "";
            break;
        case "physical":
            icon = "󰿗";
            break;
        case "personality":
            icon = "";
            break;
        case "choices":
            icon = "󰐾";
            break;
        case "preferences":
            icon = "";
            break;
        case "beliefs":
            icon = "󰛨";
            break;
        case "interactions":
            icon = "󰭹";
            break;
        case "emotional":
            icon = "󰱱";
            break;
        case "health":
            icon = "";
            break;
        case "relationships":
            icon = "";
            break;
    }

    return icon;
}

export default function Read() {
    let { assetId } = useParams();
    const { categoryId, blockId } = useParams();
    
    const { t, ready: isTranslationReady } = useTranslation();
    const navigate = useNavigate();

    assetId = assetId?.replace(/-.*/, "");

    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isDocumentView, setIsDocumentView] = useState<boolean>(true);
    const [isFocusMode, setIsFocusMode] = useState(true);

    const [template, setTemplate] = useState<GetTemplateItemType>();
    const [templateData, setTemplateData] = useState<GetTemplateCategoryItemType[]>([]);

    const currentCategoryId =
        categoryId ||
        (templateData[0]?.categoryId
            ? templateData[0].categoryId
            : "");

    const currentBlockId = blockId || "";

    const currentCategoryData = templateData.find(
        (category) => category.categoryId === currentCategoryId
    );

    const currentCategoryBlocks: GetTemplateBlockItemType[] =
        currentCategoryData?.blocks?.items ?? [];

    const currentBlockData = currentCategoryBlocks.find(
        (block) => block.blockId === currentBlockId
    );

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/characters?id=${assetId}`,
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok || !data?.items?.[0]) {
                    navigate("/404", { replace: true });
                    return;
                }

                setTemplate(data.items[0]);
            } catch (error) {
                console.error(error);
            }
        };

        if (assetId) {
            fetchCharacter();
        }
    }, [assetId, navigate]);

    useEffect(() => {
        const fetchCharacterData = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/characters/${assetId}/data`,
                    { credentials: "include" }
                );

                const json = await response.json();

                if (!response.ok) {
                    toast.show("Failed to load character", {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    });

                    return;
                }

                setTemplateData(json || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (assetId) {
            fetchCharacterData();
        }
    }, [assetId]);

    useEffect(() => {
        if (isLoading || !templateData.length || !assetId) return;

        const targetCategoryId = categoryId ?? "";
        const targetBlockId = blockId ?? "";

        let category = templateData.find(
            (item) => item.categoryId === targetCategoryId
        );

        if (!category) {
            category = templateData[0];

            if (category?.categoryId) {
                navigate(
                    `/read/${assetId}/${category.categoryId}`,
                    { replace: true }
                );
            }

            return;
        }

        if (blockId) {
            const blocks = category.blocks?.items ?? [];

            const foundBlock = blocks.find(
                (item) => item.blockId === targetBlockId
            );

            if (!foundBlock && blocks.length > 0) {
                navigate(
                    `/read/${assetId}/${category.categoryId}`,
                    { replace: true }
                );
            }
        }
    }, [assetId, blockId, categoryId, isLoading, navigate, templateData]);

    const setCurrentCategory = useCallback(
        (newCategoryId: string) => {
            navigate(`/read/${assetId}/${newCategoryId}`);
        },
        [navigate, assetId]
    );

    const setCurrentBlock = useCallback(
        (newBlockId?: string | null) => {
            if (!currentCategoryId) return;

            if (newBlockId) {
                navigate(
                    `/read/${assetId}/${currentCategoryId}/${newBlockId}`
                );
            } else {
                navigate(`/read/${assetId}/${currentCategoryId}`);
            }
        },
        [currentCategoryId, navigate, assetId]
    );

    const scrollToField = useCallback((fieldId: string) => {
        if (!fieldId) return;

        setTimeout(() => {
            const element = document.getElementById(`field-${fieldId}`);

            element?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
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
            scrollToField(window.location.hash.replace("#", ""));
        }

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [isLoading, scrollToField]);

    const scrollToCategory = useCallback((id: string) => {
        document
            .getElementById(`document-category-${id}`)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    }, []);

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
                field: GetTemplateFieldItemType;
                text: string;
            } | undefined => {
                for (const category of templateData || []) {
                    for (const block of category.blocks?.items || []) {
                        for (const row of block.rows?.items || []) {
                            for (const field of row.fields?.items || []) {
                                if (field.fieldId === id) {
                                    if (
                                        field.type?.toLowerCase() === "button"
                                    ) {
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
                                            text: options?.text || "",
                                        };
                                    }

                                    return {
                                        field,
                                        text: field.value?.content ?? "",
                                    };
                                }
                            }
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

                    const normalizedKey = refFieldId
                        .toLowerCase()
                        .replace(/[-_]/g, "");

                    let result: string;

                    if (normalizedKey === "displayname") {
                        result = template?.displayName || "";
                    } else {
                        const refTarget = getFieldValue(refFieldId);

                        if (!refTarget) return match;

                        result = String(refTarget.text);
                    }

                    for (const operation of parts) {
                        switch (operation.toLowerCase()) {
                            case "possessive":
                                result += /s$/i.test(result) ? "'" : "'s";
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
                        }
                    }

                    return result;
                }
            );
        },
        [templateData, template?.displayName]
    );

    const isFieldFilled = (
        field: GetTemplateFieldItemType
    ): boolean => {
        if (field.type === "separator") {
            return true;
        }

        if (field.type === "button") {
            let options = field.options;

            if (typeof options === "string") {
                try {
                    options = JSON.parse(options);
                } catch {
                    options = {};
                }
            }

            return Boolean(
                String(options?.text ?? "").trim()
            );
        }

        return Boolean(
            String(field.value?.content ?? "").trim()
        );
    };

    const isBlockFilled = (
        block: GetTemplateBlockItemType
    ): boolean => {
        return (block.rows?.items ?? []).some((row) =>
            (row.fields?.items ?? []).some(isFieldFilled)
        );
    };

    const documentCategories = templateData.filter(
        (category) => (category.blocks?.items ?? []).length > 0
    );

    const renderField = (
        field: GetTemplateFieldItemType,
        rowId: string
    ) => {
        const resolvedValue = resolveDynamicValues(
            field.value?.content ?? ""
        );

        return (
            <div
                key={field.fieldId}
                className={`flex-${field.flex || 1} min-w-0`}
            >
                <TemplateField
                    id={field.fieldId}
                    type={field.type}
                    label={resolveDynamicValues(field.label)}
                    placeholder={resolveDynamicValues(field.placeholder)}
                    guide={resolveDynamicValues(field.guide)}
                    value={{
                        ...field.value as GetTemplateValueType,
                        content: resolvedValue,
                    }}
                    options={field.options}
                    isLocked={field.isLocked}
                    assetId={assetId as string}
                    rowId={rowId}
                    readOnly={true}
                    // @ts-ignore
                    data={field}
                    resolveDynamicValues={resolveDynamicValues}
                    isBlockAsset={false}
                />
            </div>
        );
    };

    const renderRows = (
        block: GetTemplateBlockItemType,
        showEmptyRows: boolean
    ) => (
        <div className="flex flex-col gap-1">
            {(block.rows?.items ?? [])
                .filter((row) => {
                    if (showEmptyRows) return true;

                    return (row.fields?.items ?? []).some(isFieldFilled);
                })
                .map((row) => {
                    const fields = (row.fields?.items ?? []).filter(
                        isFieldFilled
                    );

                    if (!showEmptyRows && fields.length === 0) {
                        return null;
                    }

                    return (
                        <div
                            key={row.rowId}
                            className="flex min-h-16 gap-3"
                        >
                            <div className="min-h-[44px] w-full min-w-0 flex-1">
                                <div className="flex min-h-[44px] w-full min-w-0 gap-3">
                                    {fields.map((field) =>
                                        renderField(field, row.rowId)
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );

    if (!isTranslationReady) return null;

    if (isLoading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100">
            <span className="loading loading-spinner loading-lg" />
        </div>
    );

    return (
        <>
            <Metadata
                title={template?.displayName || template?.id}
                allowIndex={false}
            />

            <div className={isFocusMode ? "min-h-screen w-full" : "drawer lg:drawer-open"}>
                <input
                    id="my-drawer"
                    type="checkbox"
                    checked={isDrawerOpen}
                    onChange={(event) =>
                        setIsDrawerOpen(event.target.checked)
                    }
                    className="drawer-toggle"
                />

                <div
                    className={
                        isFocusMode
                            ? "h-dvh w-full min-w-0 overflow-y-auto overscroll-contain bg-base-100"
                            : "drawer-content min-w-0 border-l border-base-300"
                    }
                >
                    <nav 
                        className={`
                            navbar sticky top-0 z-30 flex w-full items-center justify-between border-b px-4
                            ${isFocusMode ? "bg-transparent border-transparent" : "bg-base-100 border-base-300"}
                        `}
                    >
                        <div className="flex gap-2">
                            {!isFocusMode && (
                                <label 
                                    htmlFor="my-drawer" 
                                    aria-label="open sidebar" 
                                    className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                                >
                                    <span className="flex h-8 w-4 leading-none items-center justify-center">
                                        <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                            
                                        </span>
                                    </span>
                                </label>
                            )}

                            <Link
                                type="button"
                                aria-label="toggle preview mode"
                                to={`${mainBaseUrl}/user/${template?.owner.primaryUsername || template?.owner.username || template?.owner.id}#characters`}
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span 
                                    className="flex h-8 w-4 font-normal items-center justify-center tooltip tooltip-accent tooltip-right"
                                    data-tip="Exit"
                                >
                                    <span className="font-nerdfont leading-none text-xl">
                                        
                                    </span>
                                </span>
                            </Link>
                        </div>
                    
                        <div className="flex-1 px-4 text-center">
                            {!isFocusMode && (
                                <>
                                    <span className="font-medium">
                                        {template?.displayName || template?.id}
                                    </span>

                                    <div className="text-sub text-xs">
                                        {template?.owner?.displayName ||
                                            template?.owner?.primaryUsername ||
                                            template?.owner?.id}
                                    </div>
                                </>
                            )}
                        </div>
                    
                        <div className="flex gap-2">
                            <button
                                type="button"
                                aria-label="toggle preview mode"
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span 
                                    className="flex h-8 w-4 font-normal items-center justify-center tooltip tooltip-accent tooltip-left"
                                    data-tip={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
                                >
                                    <span className={`${isFocusMode ? "text-accent" : ""} font-nerdfont leading-none text-xl`}>
                                        󰋱
                                    </span>
                                </span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                aria-label="toggle preview mode"
                                onClick={() => setIsDocumentView(!isDocumentView)}
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span 
                                    className="flex h-8 w-4 font-normal items-center justify-center tooltip tooltip-accent tooltip-left"
                                    data-tip={isDocumentView ? "Disable Document View" : "Enable Document View"}
                                >
                                    <span className={`${isDocumentView ? "text-accent" : ""} font-nerdfont leading-none text-xl`}>
                                        󰷊
                                    </span>
                                </span>
                            </button>
                        </div>
                    </nav>

                    <div className="flex w-full flex-col items-center p-4">
                        <div className={`
                            z-1 w-full max-w-5xl rounded-lg border bg-base-100 p-4
                            ${isFocusMode ? "border-base-100" : "border-base-300"}
                        `}>
                            {!isDocumentView ? (
                                currentCategoryData && (
                                    <>
                                        {!currentBlockId ? (
                                            <div className="p-2 md:p-4">
                                                <div className="mb-6">
                                                    <h2 className="text-2xl font-bold">
                                                        {currentCategoryData.label}
                                                    </h2>
                                                </div>

                                                {(() => {
                                                    const visibleBlocks =
                                                        currentCategoryBlocks.filter(
                                                            isBlockFilled
                                                        );

                                                    if (
                                                        visibleBlocks.length === 0
                                                    ) {
                                                        return (
                                                            <div className="py-8 text-center text-sm text-sub">
                                                                No filled blocks in this category.
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                                            {visibleBlocks.map(
                                                                (block) => (
                                                                    <button
                                                                        key={block.blockId}
                                                                        type="button"
                                                                        className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded border border-base-300 bg-base-200 p-2 shadow-xs transition-all hover:bg-base-300"
                                                                        onClick={() =>
                                                                            setCurrentBlock(
                                                                                block.blockId
                                                                            )
                                                                        }
                                                                    >
                                                                        {block.icon && (
                                                                            <img
                                                                                className="h-16 w-16 rounded object-contain"
                                                                                src={
                                                                                    block.icon.startsWith(
                                                                                        "data:"
                                                                                    )
                                                                                        ? block.icon
                                                                                        : `${cdnBaseUrl}${block.icon.replace(
                                                                                              `https://${window.config.domains.cdn}`,
                                                                                              ""
                                                                                          )}`
                                                                                }
                                                                            />
                                                                        )}

                                                                        <span className="mt-3 text-center text-lg font-semibold">
                                                                            {block.label ||
                                                                                block.blockId}
                                                                        </span>

                                                                        {block.description && (
                                                                            <span className="mt-1 line-clamp-2 text-center text-xs text-sub">
                                                                                {block.description}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="p-2 md:p-4">
                                                <div className="mb-6 flex items-center gap-3 border-b border-base-300 pb-4">
                                                    <button
                                                        type="button"
                                                        className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                                                        onClick={() =>
                                                            setCurrentBlock()
                                                        }
                                                    >
                                                        <span className="font-nerdfont text-lg leading-none">
                                                            
                                                        </span>

                                                        Back to All
                                                    </button>

                                                    <div className="h-5 w-px bg-base-300" />

                                                    <h2 className="text-xl font-bold">
                                                        {currentBlockData?.label ||
                                                            currentBlockId}
                                                    </h2>
                                                </div>

                                                {currentBlockData &&
                                                    renderRows(
                                                        currentBlockData,
                                                        false
                                                    )}
                                            </div>
                                        )}
                                    </>
                                )
                            ) : (
                                <div className="w-full min-w-0 p-2 md:p-4">
                                    {documentCategories.length === 0 ? (
                                        <div className="text-sub flex flex-col gap-8 items-center justify-center w-full h-128">
                                            <div className="font-nerdfont leading-none text-6xl">
                                                
                                            </div>

                                            This profile is a ghost town...
                                        </div>
                                    ) : (
                                        <article className="w-full min-w-0 py-8">
                                            {documentCategories.map(
                                                (category) => (
                                                    <section
                                                        key={category.categoryId}
                                                        id={`document-category-${category.categoryId}`}
                                                        className="mb-12 min-w-0 scroll-mt-36"
                                                    >
                                                        <h1 className="mb-6 border-b border-base-300 pb-3 text-4xl font-bold text-center">
                                                            <div className="font-nerdfont leading-none mb-5">
                                                                {getCategoryIcon(category.types)}
                                                            </div>

                                                            {category.label}
                                                        </h1>

                                                        {(category.blocks
                                                            ?.items ?? []
                                                        ).map((block) => (
                                                            <section
                                                                key={block.blockId}
                                                                className="mb-10 min-w-0"
                                                            >
                                                                {category.blocks.items.length > 1 && (
                                                                    <>
                                                                        <h2 className="mb-2 text-xl font-semibold text-center">
                                                                            {block.label || block.blockId}
                                                                        </h2>

                                                                        {block.description && (
                                                                            <p className="mb-6 text-sm text-sub text-center">
                                                                                {block.description}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {renderRows(
                                                                    block,
                                                                    false
                                                                )}
                                                            </section>
                                                        ))}
                                                    </section>
                                                )
                                            )}
                                        </article>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isFocusMode && (
                    <div className="drawer-side is-drawer-close:overflow-visible">
                        <label
                            htmlFor="my-drawer"
                            aria-label="Close sidebar"
                            className="drawer-overlay"
                        />

                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                            <div className="menu w-full">
                                {(() => {
                                    const visibleCategories =
                                        templateData.filter((category) =>
                                            (
                                                category.blocks?.items ?? []
                                            ).some((block) =>
                                                (
                                                    block.rows?.items ?? []
                                                ).some((row) =>
                                                    (
                                                        row.fields?.items ?? []
                                                    ).some(isFieldFilled)
                                                )
                                            )
                                        );

                                    return (
                                        <ul>
                                            {visibleCategories.map(
                                                (category) => {
                                                    return (
                                                        <li
                                                            key={category.categoryId}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="tooltip tooltip-accent tooltip-right flex h-12 items-center gap-4"
                                                                template-tip={
                                                                    category.label
                                                                }
                                                                onClick={() => {
                                                                    if (isDocumentView) {
                                                                        scrollToCategory(
                                                                            category.categoryId
                                                                        );
                                                                    } else {
                                                                        setCurrentCategory(
                                                                            category.categoryId
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <span className="font-nerdfont flex h-8 w-4 items-center justify-center text-xl leading-none">
                                                                    {getCategoryIcon(category.types)}
                                                                </span>

                                                                <span className="is-drawer-close:hidden text-sm">
                                                                    {
                                                                        category.label
                                                                    }
                                                                </span>
                                                            </button>
                                                        </li>
                                                    );
                                                }
                                            )}
                                        </ul>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
