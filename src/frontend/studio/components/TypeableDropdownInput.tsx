import React, { useState, useRef, useEffect } from "react";

interface TypeableDropdownInputProps {
    value?: string;
    options?: string[];
    placeholder?: string;
    onChange?: (val: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

export const TypeableDropdownInput: React.FC<TypeableDropdownInputProps> = ({
    value = "",
    options = [],
    placeholder = "Select or type...",
    onChange,
    onFocus,
    onBlur,
    onContextMenu,
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [openAbove, setOpenAbove] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>(value);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuMaxHeight = 250;
            
            if (spaceBelow < menuMaxHeight && rect.top > menuMaxHeight) {
                setOpenAbove(true);
            } else {
                setOpenAbove(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                if (isOpen) {
                    setIsOpen(false);
                    onBlur?.();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onBlur]);

    const filteredOptions = (options || []).filter((opt) =>
        String(opt).toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    // Reset keyboard highlight whenever search options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchTerm]);

    // Keep highlighted keyboard option in scroll view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    const handleSelectOption = (opt: string) => {
        setSearchTerm(opt);
        onChange?.(opt);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onBlur?.();
    };

    const handleToggleMenu = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            inputRef.current?.focus();
            onFocus?.();
        } else {
            onBlur?.();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
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
                if (isOpen && filteredOptions.length > 0) {
                    e.preventDefault();
                    if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                        handleSelectOption(filteredOptions[highlightedIndex]);
                    } else {
                        handleSelectOption(filteredOptions[0]);
                    }
                }
                break;
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                onBlur?.();
                break;
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            onContextMenu={onContextMenu}
        >
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                placeholder={placeholder}
                className="input input-bordered bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base pr-10 bg-none focus:outline-none"
                onChange={(e) => {
                    const newVal = e.target.value;
                    setSearchTerm(newVal);
                    onChange?.(newVal);
                    setIsOpen(true);
                }}
                onFocus={(e) => {
                    e.target.select();
                    onFocus?.();
                    setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
            />

            <button
                type="button"
                onClick={handleToggleMenu}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-sub hover:text-base-content transition-colors cursor-pointer"
            >
                <span
                    className={`font-nerdfont flex items-center justify-center text-sm leading-none h-4 w-4 transition-transform duration-200 
                    ${isOpen ? "rotate-180" : ""}`}
                >
                    
                </span>
            </button>

            {isOpen && (
                <ul
                    ref={listRef}
                    role="listbox"
                    className={`absolute z-50 w-full max-h-60 overflow-auto rounded-md bg-base-200 border border-base-300 shadow-lg py-1 text-base focus:outline-none ${
                        openAbove ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                >
                    {filteredOptions.length === 0 ? (
                        <li className="px-4 py-2.5 text-sm text-sub italic">
                            No matching options
                        </li>
                    ) : (
                        filteredOptions.map((opt, i) => {
                            const isHighlighted = i === highlightedIndex;
                            const isSelected = opt === searchTerm;

                            return (
                                <li
                                    key={i}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-base-300 ${
                                        isHighlighted || isSelected
                                            ? "bg-base-300 text-base-content"
                                            : "text-base-content"
                                    }`}
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectOption(opt);
                                    }}
                                >
                                    {opt}
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
};
