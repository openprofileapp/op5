/* eslint-disable react-hooks/refs */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { CheckboxInput } from "./CheckboxInput.js";

import { 
    DropdownOptionItem, 
    DropdownOptionValue, 
    DropdownOptionsType 
} from "../../../_common/types/dropdown.type.js";

interface NormalizedOption {
    id: DropdownOptionValue;
    name: string;
    category?: string;
}

interface TypeableDropdownInputProps {
    value?: DropdownOptionValue | DropdownOptionValue[];
    options?: DropdownOptionsType;
    placeholder?: string;
    typeable?: boolean;
    multiple?: boolean;
    title?: string;
    defaultOpenAbove?: boolean;
    onChange?: (value: unknown) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

export const TypeableDropdownInput: React.FC<TypeableDropdownInputProps> = ({
    value = "",
    options = [],
    placeholder,
    typeable = true,
    multiple = false,
    title,
    defaultOpenAbove = false,
    onChange,
    onFocus,
    onBlur,
    onContextMenu,
}) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const normalizedOptions = useMemo<NormalizedOption[]>(() => {
        if (Array.isArray(options)) {
            return options.flatMap((opt) => {
                if (typeof opt === "object" && opt !== null && "id" in opt) {
                    return [{ id: opt.id, name: opt.name, category: opt.category }];
                }
                if (typeof opt === "object" && opt !== null) {
                    return Object.entries(opt).map(([id, name]) => ({ id, name: String(name) }));
                }
                return [{ id: opt, name: String(opt) }];
            });
        }

        if (typeof options === "object" && options !== null) {
            const entries = Object.entries(options);
            const isGrouped = entries.some(([, val]) => Array.isArray(val));

            if (isGrouped) {
                const result: NormalizedOption[] = [];
                Object.entries(options as Record<string, DropdownOptionItem[]>).forEach(
                    ([categoryName, categoryOptions]) => {
                        if (Array.isArray(categoryOptions)) {
                            categoryOptions.forEach((opt) => {
                                if (typeof opt === "object" && opt !== null) {
                                    result.push({
                                        id: opt.id,
                                        name: opt.name,
                                        category: opt.category || categoryName,
                                    });
                                } else {
                                    result.push({
                                        id: opt,
                                        name: String(opt),
                                        category: categoryName,
                                    });
                                }
                            });
                        }
                    }
                );
                return result;
            }

            return Object.entries(options as Record<string, string>).map(([id, name]) => ({
                id,
                name: String(name),
            }));
        }

        return [];
    }, [options]);

    const selectedValues = useMemo<DropdownOptionValue[]>(() => {
        if (multiple) {
            return Array.isArray(value) ? value : value !== "" && value !== undefined ? [value] : [];
        }
        return [];
    }, [value, multiple]);

    const getDisplayName = useCallback(
        (val: DropdownOptionValue) => {
            const matched = normalizedOptions.find((opt) => opt.id === val || opt.name === val);
            return matched ? matched.name : String(val || "");
        },
        [normalizedOptions]
    );

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [openAbove, setOpenAbove] = useState<boolean>(defaultOpenAbove);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    
    const [inputValue, setInputValue] = useState<string>(() =>
        multiple ? "" : getDisplayName(value as DropdownOptionValue)
    );

    const [prevValue, setPrevValue] = useState<DropdownOptionValue | DropdownOptionValue[]>(value);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const [portalCoords, setPortalCoords] = useState<{
        top: number;
        left: number;
        width: number;
    }>({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    if (value !== prevValue) {
        setPrevValue(value);
        if (!multiple) {
            setInputValue(getDisplayName(value as DropdownOptionValue));
        }
    }

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isOpen]);

    const updatePortalCoords = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuMaxHeight = 320;

            const shouldOpenAbove = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;
            setOpenAbove(defaultOpenAbove || shouldOpenAbove);

            setPortalCoords({
                top: (defaultOpenAbove || shouldOpenAbove) ? rect.top : rect.bottom,
                left: rect.left,
                width: rect.width,
            });
        }
    }, [defaultOpenAbove]);

    useEffect(() => {
        if (isOpen && !isMobile) {
            updatePortalCoords();
            
            window.addEventListener("resize", updatePortalCoords);

            return () => {
                window.removeEventListener("resize", updatePortalCoords);
            };
        }
    }, [isOpen, isMobile, updatePortalCoords]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isMobile) return;

            const targetNode = e.target as Node;
            const isClickInsideContainer = containerRef.current?.contains(targetNode);
            const isClickInsideList = listRef.current?.contains(targetNode);

            if (!isClickInsideContainer && !isClickInsideList) {
                if (isOpen) {
                    setIsOpen(false);
                    onBlur?.();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, isMobile, onBlur]);

    const filteredOptions = useMemo(() => {
        if (!typeable) return normalizedOptions;
        const term = inputValue.trim().toLowerCase();
        if (!term) return normalizedOptions;

        return normalizedOptions.filter(
            (opt) =>
                opt?.name?.toLowerCase().includes(term) ||
                String(opt?.id).toLowerCase().includes(term) ||
                opt?.category?.toLowerCase().includes(term)
        );
    }, [normalizedOptions, typeable, inputValue]);

    const groupedFilteredOptions = useMemo(() => {
        const uncategorized: NormalizedOption[] = [];
        const categorized: NormalizedOption[] = [];

        filteredOptions.forEach((opt) => {
            if (opt.category) {
                categorized.push(opt);
            } else {
                uncategorized.push(opt);
            }
        });

        const groups: { category?: string; options: NormalizedOption[] }[] = [];

        if (uncategorized.length > 0) {
            groups.push({
                category: undefined,
                options: uncategorized,
            });
        }

        categorized.forEach((opt) => {
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.category === opt.category) {
                lastGroup.options.push(opt);
            } else {
                groups.push({
                    category: opt.category,
                    options: [opt],
                });
            }
        });

        return groups;
    }, [filteredOptions]);

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.querySelector(
                `[data-option-index="${highlightedIndex}"]`
            ) as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    if (!isTranslationReady) return null;

    const resolvedTitle = title ?? t("components.dropdown.selectOption", "Select Option");
    const resolvedPlaceholder = placeholder ?? t("components.dropdown.selectOrType", "Select or type...");

    const handleClose = () => {
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (multiple) setInputValue("");
        onBlur?.();
    };

    const handleSelectOption = (opt: NormalizedOption) => {
        if (multiple) {
            const exists = selectedValues.includes(opt.id);
            const next = exists
                ? selectedValues.filter((v) => v !== opt.id)
                : [...selectedValues, opt.id];
            onChange?.(next);
            setInputValue("");
        } else {
            setInputValue(opt?.name);
            onChange?.(opt.id);
            handleClose();
        }
    };

    const handleRemoveBadge = (valToRemove: DropdownOptionValue, e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple) {
            const next = selectedValues.filter((v) => v !== valToRemove);
            onChange?.(next);
        }
    };

    const handleToggleMenu = () => {
        const nextState = !isOpen;

        setIsOpen(nextState);

        if (nextState) {
            if (typeable && !isMobile) inputRef.current?.focus();
            onFocus?.();
        } else {
            handleClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(0);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelectOption(filteredOptions[highlightedIndex]);
                } else if (!multiple && typeable) {
                    onChange?.(inputValue);
                    handleClose();
                }
                break;
            case "Escape":
                handleClose();
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!typeable) return;
        const newVal = e.target.value;
        setInputValue(newVal);
        setHighlightedIndex(-1);
        if (!multiple) {
            onChange?.(newVal);
        }
        setIsOpen(true);
    };

    const handleListWheel = (e: React.WheelEvent<HTMLUListElement>) => {
        const target = e.currentTarget;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;

        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
        const isAtTop = target.scrollTop <= 0;

        if ((isScrollingDown && isAtBottom) || (isScrollingUp && isAtTop)) {
            e.preventDefault();
        }
    };

    const getPortalTarget = () => {
        if (typeof document === "undefined") return null;
        return containerRef.current?.closest("dialog[open]") || containerRef.current?.closest("dialog") || document.body;
    };

    const renderOptionList = () => {
        let globalIndexCounter = 0;

        return (
            <ul
                ref={listRef}
                role="listbox"
                onWheel={handleListWheel}
                onMouseLeave={() => setHighlightedIndex(-1)}
                style={
                    !isMobile
                        ? {
                            position: "fixed",
                            top: openAbove ? undefined : `${portalCoords.top + 4}px`,
                            bottom: openAbove ? `${window.innerHeight - portalCoords.top + 4}px` : undefined,
                            left: `${portalCoords.left}px`,
                            width: `${portalCoords.width}px`,
                        }
                        : undefined
                }
                className={
                    isMobile
                        ? "flex scrollbar flex-col w-full h-full min-h-0 overflow-y-auto text-sm overscroll-contain"
                        : "flex flex-col z-[2147483647] max-h-80 overflow-y-auto rounded-md bg-base-200 border border-base-300 shadow-2xl text-sm focus:outline-none overscroll-contain"
                }
            >
                {groupedFilteredOptions.length === 0 ? (
                    <li className="flex items-center px-4 h-10 min-h-10 text-sm text-sub w-full text-left">
                        No matching options
                    </li>
                ) : (
                    groupedFilteredOptions.map((group, groupIdx) => (
                        <React.Fragment key={group.category || `group-${groupIdx}`}>
                            {group.category && (
                                <li className="sticky top-0 z-10 bg-base-300/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-sub px-4 py-1.5 border-y border-base-300/50 select-none">
                                    {group.category}
                                </li>
                            )}
                            {group.options.map((opt) => {
                                const currentIndex = globalIndexCounter++;
                                const isHighlighted = currentIndex === highlightedIndex;
                                const isSelected = multiple
                                    ? selectedValues.includes(opt.id)
                                    : opt.id === value || opt.name === value;

                                return (
                                    <li
                                        key={opt.id}
                                        data-option-index={currentIndex}
                                        role="option"
                                        aria-selected={isSelected}
                                        className="flex items-center w-full h-10 min-h-10 text-sm shrink-0"
                                        onMouseEnter={() => setHighlightedIndex(currentIndex)}
                                    >
                                        {multiple ? (
                                            <div className="w-full h-10 min-h-10 flex items-center">
                                                <CheckboxInput
                                                    label={opt?.name}
                                                    checked={isSelected ? 1 : 0}
                                                    onChange={() => handleSelectOption(opt)}
                                                    selected={isSelected || isHighlighted}
                                                    isDropdownOption={true}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={`w-full h-10 min-h-10 px-4 flex items-center cursor-pointer transition-colors ${
                                                    isHighlighted || isSelected ? "bg-base-300" : ""
                                                }`}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelectOption(opt);
                                                }}
                                            >
                                                <span className="truncate">{opt?.name}</span>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </React.Fragment>
                    ))
                )}
            </ul>
        );
    };

    const portalTargetNode = getPortalTarget();

    return (
        <div
            ref={containerRef}
            className="flex flex-col w-full relative"
            onContextMenu={onContextMenu}
        >
            <div className="relative w-full flex flex-col">
                <div
                    className={`input input-bordered bg-base-100 border border-base-300 w-full min-h-10 h-auto py-1.5 pl-3 pr-10 text-sm flex flex-wrap items-center gap-1.5 focus-within:outline-none ${
                        !typeable ? "cursor-pointer select-none" : ""
                    }`}
                    onClick={() => {
                        if (!typeable) {
                            handleToggleMenu();
                        } else {
                            setIsOpen(true);
                            inputRef.current?.focus();
                        }
                    }}
                >
                    {multiple &&
                        selectedValues.map((val) => (
                            <span
                                key={val}
                                className="flex gap-1.5 px-2 py-1 bg-base-200 text-xs text-left border border-base-300 rounded items-center"
                            >
                                {getDisplayName(val)}

                                <button
                                    type="button"
                                    className="cursor-pointer text-error text-xs font-nerdfont leading-none"
                                    onClick={(e) => handleRemoveBadge(val, e)}
                                >
                                    
                                </button>
                            </span>
                        ))}

                    <input
                        ref={inputRef}
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        readOnly={!typeable}
                        value={inputValue}
                        placeholder={selectedValues.length > 0 ? "" : resolvedPlaceholder}
                        className={`bg-transparent outline-none flex-1 min-w-[60px] text-sm ${
                            !typeable ? "cursor-pointer select-none caret-transparent" : ""
                        }`}
                        onChange={handleInputChange}
                        onFocus={onFocus}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleToggleMenu}
                    className="absolute right-0 top-0 h-10 flex items-center justify-center px-3 text-sub transition-colors cursor-pointer"
                >
                    <span
                        className={`font-nerdfont flex items-center justify-center text-sm leading-none h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                    >
                        
                    </span>
                </button>
            </div>

            {isOpen && !isMobile && portalTargetNode && createPortal(renderOptionList(), portalTargetNode)}

            {isOpen && isMobile && portalTargetNode && createPortal(
                <div className="modal modal-open modal-bottom sm:modal-middle z-[2147483647] fixed inset-0">
                    <div className="modal-box bg-base-100 p-5 relative flex flex-col w-full max-w-md h-[90vh] max-h-[90vh] z-[2147483647]">
                        <button
                            type="button"
                            className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-30"
                            onClick={handleClose}
                        >
                            
                        </button>

                        <div className="flex flex-col w-full h-full min-h-0 space-y-4">
                            <h3 className="font-bold text-2xl text-center w-full pt-1 shrink-0 mb-6">
                                {resolvedTitle}
                            </h3>

                            {typeable && (
                                <input
                                    type="text"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    className="input input-bordered w-full text-sm text-left focus:outline-none shrink-0"
                                    placeholder="Search..."
                                    value={inputValue}
                                    onChange={handleInputChange}
                                />
                            )}

                            <div className="flex-1 min-h-0 w-full overflow-hidden">
                                {renderOptionList()}
                            </div>
                        </div>
                    </div>
                    <form
                        method="dialog"
                        className="modal-backdrop z-[2147483646] fixed inset-0 bg-black/50"
                        onClick={handleClose}
                    >
                        <button type="button">close</button>
                    </form>
                </div>,
                portalTargetNode
            )}
        </div>
    );
};
