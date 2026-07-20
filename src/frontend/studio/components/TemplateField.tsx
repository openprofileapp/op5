import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import React from "react";

import colors from "tailwindcss/colors";

type Props = {
    id: string;
    label?: string;
};

{/* pass name and type and stuff and gen data api and stuff */}
export default function TemplateField({
    id,
    label,
    dragHandleProps
}: Props) {
    const { t, ready } = useTranslation();

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

    if (!ready) return null;

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
                    </legend>

                    <textarea
                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base overflow-hidden z-2"
                        id={`template-field-${id}`}
                        placeholder="What is <CHARACTER>'s full name?"
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
                        onContextMenu={(e) => {
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
                        }}
                        onInput={(e) => {
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                    />

                    <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                            isFocused ? "max-h-200 opacity-100" : "max-h-0 opacity-0 mt-[-24px] z-1"
                        }`}
                    >
                        <div className="bg-accent rounded px-3 py-2 text-sm">
                            <span className="font-nerdfont leading-none mr-2">󰋼</span>
                            Be sure to include undefined prefixes and suffixes if any.
                        </div>
                    </div>
                </fieldset>
            </div>
        </>
    );
}