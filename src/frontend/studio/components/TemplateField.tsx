import { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";

import colors from "tailwindcss/colors";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";

interface DropdownOption {
    label: string;
    value: string | number;
}

interface ComboboxProps {
    options?: (string | DropdownOption)[];
    value?: string | number;
    defaultValue?: string | number;
    placeholder?: string;
    onChange?: (value: string | number) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
    className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
    options = [],
    value,
    defaultValue = "",
    placeholder = "Type or select...",
    onChange,
    onFocus,
    onBlur,
    onContextMenu,
    className = "",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" && opt !== null
      ? opt
      : { label: String(opt), value: opt }
  );

  // Sync state if external value changes
  useEffect(() => {
    if (value !== undefined) {
      const matched = normalizedOptions.find((opt) => opt.value === value);
      setSearchTerm(matched ? matched.label : String(value));
    } else if (defaultValue) {
      const matched = normalizedOptions.find((opt) => opt.value === defaultValue);
      setSearchTerm(matched ? matched.label : String(defaultValue));
    }
  }, [value, defaultValue]);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  // Filter options based on user typing
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    setIsOpen(true);
    onChange?.(newVal);
  };

  const handleSelect = (option: DropdownOption) => {
    setSearchTerm(option.label);
    setIsOpen(false);
    onChange?.(option.value);
    onBlur?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      onContextMenu={onContextMenu}
    >
      <div className="relative flex items-center">
        {/* Input where user can type */}
        <input
          type="text"
          value={searchTerm}
          placeholder={placeholder}
          className="input input-bordered bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            onFocus?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              onBlur?.();
            }
          }}
        />

        {/* Dropdown Arrow Indicator */}
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 text-sm opacity-50 hover:opacity-100 cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* Filtered Results Menu */}
      {isOpen && (
        <ul
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-base-100 border border-base-300 shadow-lg py-1 text-base focus:outline-none"
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-base-content/50">
              No matching options
            </li>
          ) : (
            filteredOptions.map((opt, i) => (
              <li
                key={i}
                role="option"
                onClick={() => handleSelect(opt)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-base-200 transition-colors"
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

interface Props {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    guide?: string;
    value?: string;
    options?: unknown[];
    thoughts?: string;
    comments?: string;
    dragHandleProps?: {
        className?: string;
        ref?: (element: HTMLElement | null) => void;
        [key: string]: unknown;
    };
}

{/* rename to fieldRenderer */}
{/* pass name and type and stuff and gen data api and stuff */}
export default function TemplateField({
    id,
    type,
    label,
    placeholder,
    guide,
    value,
    options,
    thoughts,
    comments,
    dragHandleProps
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [isFocused, setIsFocused] = useState(false);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

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
        document
            .getElementById(`field-dropdown-${id}`)
            ?.hidePopover();
    }, []);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsContextMenuOpen(true);

        const popover = document.getElementById(
            `field-dropdown-${id}`
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

    const getTextColor = (color: string) => {
        const [name, shade] = color.split("-");

        const value =
            colors[name as keyof typeof colors]?.[
                shade as keyof (typeof colors)[keyof typeof colors]
            ];

        if (!value || typeof value !== "string") {
            return "#1a1a1a";
        }

        const match = value.match(
            /oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/
        );

        if (!match) {
            return "#1a1a1a";
        }

        const [, l] = match;

        const lightness = Number(l);

        const textColor =
            lightness > 60
                ? "#1a1a1a"
                : "#eaeaea";

        console.log({
            color,
            value,
            lightness,
            textColor,
        });

        return textColor;
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`field-dropdown-${id}`);

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

    const checkCollectionMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsContextMenuFlipped(spaceRight < submenuWidth);
    };

    const renderInputContent = () => {
        switch (type) {
            case "button":
                return (
                    <a
                        href={url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-accent w-full min-h-10 h-10 flex items-center justify-center gap-2"
                        onContextMenu={handleContextMenu}
                    >
                        <span>{label || "Click Here"}</span>
                        <span className="font-nerdfont"></span>
                    </a>
                );

            case "dropdown":
                return (
                    <>
                        <TypeableDropdownInput
                            value={value}
                            options={options}
                            placeholder="Select or type..."
                            onChange={(newValue) => {
                                if (typeof onChange === "function") {
                                    onChange(newValue);
                                }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onContextMenu={handleContextMenu}
                        />
                    </>
                );
                
            case "slider":
                return (
                    <div 
                        className="w-full flex items-center h-10"
                        onContextMenu={handleContextMenu}
                    >
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue={value ?? 50}
                            className="range range-accent range-sm w-full"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </div>
                );

            case "color":
                return (
                    <div 
                        className="flex gap-2 items-center w-full h-10"
                        onContextMenu={handleContextMenu}
                    >
                        <input
                            type="color"
                            defaultValue={value || "#3b82f6"}
                            className="input input-bordered h-10 w-16 p-1 cursor-pointer bg-base-100 border border-base-300"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        <span className="font-mono text-sm">{value || "#3b82f6"}</span>
                    </div>
                );

            case "rating":
                return (
                    <div 
                        className="rating rating-md h-10 items-center"
                        onContextMenu={handleContextMenu}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <input
                                key={star}
                                type="radio"
                                name={`rating-${id}`}
                                className="mask mask-star-2 bg-orange-400"
                                defaultChecked={value === star}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        ))}
                    </div>
                );

            case "asset":
                return (
                    <div 
                        className="input input-bordered bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base flex items-center justify-between cursor-pointer"
                        onContextMenu={handleContextMenu}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        tabIndex={0}
                    >
                        <span className="truncate text-sub">{value || "Select Asset..."}</span>
                        <span className="font-nerdfont text-lg"></span>
                    </div>
                );

            case "text":
            default:
                return (
                    <textarea
                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base overflow-hidden z-2"
                        id={`template-field-${id}`}
                        defaultValue={value}
                        placeholder={
                            placeholder
                                ?.replace("{DISPLAY_NAME}", "Alice")
                                ?.replace("{DISPLAY_NAME_POSSESSIVE}", "Alice's")
                        }
                        rows={1}
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
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
        <>                           
            <ul
                className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
                popover="manual"
                id={`field-dropdown-${id}`}
            >
                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            const titles = ["Dr.", "Sir"];

                            const firstNames = [
                                "Liam", "Noah", "Oliver", "James", "Emma", "Olivia",
                                "Sophia", "Charlotte", "Amelia", "Lucas", "Nathaniel",
                                "Evelyn", "Theodore", "Julian", "Isla", "Rowan",
                                "Ezra", "Arthur", "Vivian", "Adrian", "Felix"
                            ];

                            const middleNames = [
                                "Alexander", "Grace", "Marie", "Rose", "James",
                                "Anne", "Elizabeth", "Michael", "Joseph", "Lee",
                                "Kai", "Jean", "Orion", "August", "Skye"
                            ];

                            const lastNames = [
                                "Smith", "Johnson", "Williams", "Brown", "Jones",
                                "Garcia", "Miller", "Davis", "Wilson", "Taylor",
                                "Blackwood", "Ashcroft", "Montgomery", "Fairchild"
                            ];

                            const suffixes = ["Jr."];

                            const random = <T,>(arr: T[]) =>
                                arr[Math.floor(Math.random() * arr.length)];

                            const parts: string[] = [];

                            if (Math.random() < 0.2) {
                                parts.push(random(titles));
                            }

                            parts.push(random(firstNames));

                            if (Math.random() < 0.7) {
                                parts.push(random(middleNames));
                            }

                            parts.push(random(lastNames));

                            if (Math.random() < 0.15) {
                                parts.push(random(suffixes));
                            }

                            const response = parts.join(" ");

                            const textarea = document.getElementById(`template-field-${id}`);

                            if (textarea) {
                                textarea.value = "";
                            }

                            let index = 0;

                            const interval = setInterval(() => {
                                index++;

                                if (textarea) {
                                    textarea.value = response.slice(0, index);
                                }

                                if (index >= response.length) {
                                    clearInterval(interval);
                                }
                            }, 20);

                            closeContextMenu();
                        }}
                    >
                        Generate
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <hr />

                {isFocused && (
                    <li 
                        className="relative group"
                        onMouseEnter={checkCollectionMenuPosition}
                    >
                        <button className="flex items-center justify-between gap-4 w-full">
                            Format
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </button>

                        <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                        <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Bold
                                    <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                        
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Italic
                                    <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                        
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Underline
                                    <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                        
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Strikethrough
                                    <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                        
                                    </span>
                                </button>
                            </li>
                        </ul>
                    
                    </li>
                )}

                {isFocused && (
                    <li 
                        className="relative group"
                        onMouseEnter={checkCollectionMenuPosition}
                    >
                        <button className="flex items-center justify-between gap-4 w-full">
                            Highlight
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </button>

                        <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                        <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Yellow
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-yellow-400"
                                        style={{ color: getTextColor("yellow-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Orange
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-orange-400"
                                        style={{ color: getTextColor("orange-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Red
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-red-400"
                                        style={{ color: getTextColor("red-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Pink
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-pink-400"
                                        style={{ color: getTextColor("pink-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Purple
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-purple-400"
                                        style={{ color: getTextColor("purple-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Blue
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-blue-400"
                                        style={{ color: getTextColor("blue-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Green
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-green-400"
                                        style={{ color: getTextColor("green-400") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <hr />
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    My Custom Purple
                                    <span 
                                        className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-purple-800"
                                        style={{ color: getTextColor("purple-800") }}
                                    >
                                        󰙒
                                    </span>
                                </button>
                            </li>
                            <hr />
                            <li>
                                <button 
                                    className="flex items-center justify-between gap-4"
                                    onClick={() => {
                                        // exampleTrigger();
                                        // closeContextMenu(id);
                                    }}
                                >
                                    Add Custom Color
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </li>
                )}
                
                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Notes
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <hr />

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Cut
                        <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                            Ctrl+X
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Copy
                        <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                            Ctrl+C
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Paste
                        <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                            Ctrl+P
                        </span>
                    </button>
                </li>
                
                <hr />

                <li 
                    className="relative group"
                    onMouseEnter={checkCollectionMenuPosition}
                >
                    <button className="flex items-center justify-between gap-4 w-full">
                        Assign to
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>

                    <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                    <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                        <li>
                            <button 
                                className="flex items-center justify-between gap-4"
                                onClick={() => {
                                    // exampleTrigger();
                                    // closeContextMenu(id);
                                }}
                            >
                                J9 Studios
                                <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                    <img 
                                        className="rounded-full translate-x-[2px]"
                                        src="https://cdn.openprofile.app//uploads/users/5019646586243236/5019646586243236.png"
                                    />
                                </span>
                            </button>
                        </li>
                        <li>
                            <button 
                                className="flex items-center justify-between gap-4"
                                onClick={() => {
                                    // exampleTrigger();
                                    // closeContextMenu(id);
                                }}
                            >
                                OpenProfile
                                <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                    <img 
                                        className="rounded-full translate-x-[2px]"
                                        src="https://cdn.openprofile.app/uploads/users/9534968913312158/9534968913312158.png"
                                    />
                                </span>
                            </button>
                        </li>
                        <hr />
                        <li>
                            <button 
                                className="flex items-center justify-between gap-4"
                                onClick={() => {
                                    // exampleTrigger();
                                    // closeContextMenu(id);
                                }}
                            >
                                Invite User
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </button>
                        </li>
                    </ul>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Edit Field
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Lock Field
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <hr />

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Share
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰒗
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            // exampleTrigger();
                            // closeContextMenu(id);
                        }}
                    >
                        Copy ID
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰅇
                        </span>
                    </button>
                </li>
            </ul>

            <div className="flex gap-3 w-full">
                <fieldset className="fieldset w-full">

                    <legend className="fieldset-legend text-sm font-normal">
                        {dragHandleProps && (
                            <span
                                {...dragHandleProps}
                            >
                                <button className="flex items-center justify-center w-4 rounded-full overflow-hidden cursor-grab">
                                    <span className="font-nerdfont leading-none text-2xl">
                                        󰇛
                                    </span>
                                </button>
                            </span>
                        )}

                        {label}
                        
                        <span 
                            className="tooltip hidden"
                            data-tip="Assigned to AvatarKage"
                        >
                            <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </span>

                        <span 
                            className="tooltip hidden"
                            data-tip="Awaiting publisher review"
                        >
                            <span className="font-nerdfont text-xl text-info flex w-4 leading-none items-center justify-center">
                                󱍸
                            </span>
                        </span>

                        <span 
                            className="tooltip hidden"
                            data-tip="Changes approved by J9 Studios"
                        >
                            <span className="font-nerdfont text-lg text-success flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </span>

                        <span 
                            className="tooltip hidden"
                            data-tip="Changes rejected by J9 Studios (awaiting author revision)"
                        >
                            <span className="font-nerdfont text-lg text-error flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </span>

                        <span 
                            className="tooltip hidden"
                            data-tip="Locked"
                        >
                            <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </span>

                        <span 
                            className="tooltip hidden"
                        >
                            <div className="flex flex-col gap-1 tooltip-content text-left">
                                <div className="font-bold text-center">Notes</div>
                                <div className="text-xs">AvatarKage (07/17/26): Don't forget to include the character's title</div>
                                <div className="text-xs">J9 Studios (07/17/26): The author should include their suffix</div>
                            </div>
                            <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </span>

                        <span 
                            className={`tooltip ${thoughts ? "" : "hidden"}`}
                        >
                            <div className="flex flex-col gap-1 tooltip-content text-left">
                                <div className="font-bold text-center">DISPLAY_NAME's Thoughts</div>
                                <div className="text-xs">{thoughts}</div>
                            </div>
                            <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                󰟶
                            </span>
                        </span>

                        <span 
                            className={`tooltip ${comments ? "" : "hidden"}`}
                        >
                            <div className="flex flex-col gap-1 tooltip-content text-left">
                                <div className="font-bold text-center">Author's Comment</div>
                                <div className="text-xs">{comments}</div>
                            </div>
                            <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                󰅺
                            </span>
                        </span>
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
                                            const isFirstParagraph = node?.position?.start.line === 1;
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
                                            const isFirstList = node?.position?.start.line === 1;
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
                                        
                                        li: ({ children }) => <li className="my-0">{children}</li>,

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
                                    {
                                        guide
                                            ?.replace("{DISPLAY_NAME}", "Alice")
                                            ?.replace("{DISPLAY_NAME_POSSESSIVE}", "Alice's")
                                    }
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </fieldset>
            </div>
        </>
    );
}
