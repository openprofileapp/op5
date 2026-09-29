
import { useState, useEffect, useRef } from "react";

type RecommendedTag = {
    tag: string;
    label?: string;
};

type Props = {
    id?: string;
    value?: string;
    defaultValue?: string[];
    onChange?: (tags: string[]) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    maxTags?: number;
    minLength?: number;
    maxLength?: number;
    recommendedTags?: (string | RecommendedTag)[];
    showRecommended?: boolean;
    onContextMenu?: (e: React.MouseEvent) => void;
    onInvalid?: (message: string) => void;
};

const normalizeRecommended = (
    tags: (string | RecommendedTag)[]
): RecommendedTag[] =>
    tags.map((item) =>
        typeof item === "string" ? { tag: item } : item
    );

export default function TagInput({
    id,
    value,
    defaultValue = [],
    onChange,
    className = "",
    placeholder = "your-tag-here",
    disabled = false,
    readOnly = false,
    maxTags = 10,
    minLength = 3,
    maxLength = 24,
    recommendedTags = [],
    showRecommended = true,
    onContextMenu,
    onInvalid,
}: Props) {
    const [internalTags, setInternalTags] = useState<string[]>(
        () => [...defaultValue]
    );
    const [tagInput, setTagInput] = useState("");
    const [isRecommendationsOpen, setIsRecommendationsOpen] =
        useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const formattedTags: string[] = Array.isArray(value)
        ? value
        : typeof value === "string" && value.trim()
            ? value.split(",").map((tag) => tag.trim()).filter(Boolean)
            : [];

    const currentTags = formattedTags !== undefined ? formattedTags : internalTags;

    const normalizedRecommended = normalizeRecommended(recommendedTags);

    const tagRegex = /^[a-z-]+$/;

    useEffect(() => {
        if (value !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInternalTags([...value]);
        }
    }, [value]);

    const updateTags = (nextTags: string[]) => {
        if (value === undefined) {
            setInternalTags(nextTags);
        }

        onChange?.(nextTags);
    };

    const reportError = (message: string) => {
        onInvalid?.(message);
    };

    const handleAddTag = (tagToAdd = tagInput) => {
        if (disabled || readOnly) return;

        const trimmed = tagToAdd.trim().toLowerCase();

        if (!trimmed) return;

        if (trimmed.length < minLength || trimmed.length > maxLength) {
            reportError(
                `Tags must be between ${minLength} and ${maxLength} characters`
            );
            return;
        }

        if (!tagRegex.test(trimmed)) {
            reportError("Tags can only contain a-z and dashes");
            return;
        }

        if (currentTags.includes(trimmed)) {
            reportError("Tag already added");
            return;
        }

        if (currentTags.length >= maxTags) {
            reportError(
                `You have reached the maximum amount (${maxTags}) of tags.`
            );
            return;
        }

        updateTags([...currentTags, trimmed]);
        setTagInput("");
    };

    const handleDeleteTag = (indexToDelete: number) => {
        if (disabled || readOnly) return;

        updateTags(
            currentTags.filter((_, index) => index !== indexToDelete)
        );
    };

    const hasRecommendedTag = normalizedRecommended.some(
        (item) => currentTags.includes(item.tag.toLowerCase())
    );

    return (
        <div
            ref={containerRef}
            id={id}
            className={`flex flex-col gap-1 relative ${className}`}
            onContextMenu={onContextMenu}
        >
            {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {currentTags.map((tag, index) => (
                        <div
                            key={`${tag}-${index}`}
                            className="flex gap-2 items-center justify-center rounded-full bg-base-100 text-xs px-3 py-1 border border-base-300"
                        >
                            <span
                                className="font-nerdfont leading-none"
                                aria-hidden="true"
                            >
                                
                            </span>

                            <span className="mb-0.5">{tag}</span>

                            {!readOnly && (
                                <button
                                    type="button"
                                    disabled={disabled}
                                    aria-label={`Remove tag ${tag}`}
                                    className="cursor-pointer text-error text-xs font-nerdfont leading-none disabled:cursor-default"
                                    onClick={() => handleDeleteTag(index)}
                                >
                                    
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showRecommended &&
                normalizedRecommended.length > 0 &&
                !hasRecommendedTag && (
                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            className="flex gap-1 items-center text-xs text-left cursor-pointer"
                            onClick={() =>
                                setIsRecommendationsOpen((prev) => !prev)
                            }
                            aria-expanded={isRecommendationsOpen}
                        >
                            <span className="font-nerdfont text-sm leading-none">
                                
                            </span>

                            <span>
                                Missing an optional, but recommended tag (click to view)
                            </span>
                        </button>

                        {isRecommendationsOpen && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {normalizedRecommended.map((item) => {
                                    const tag = item.tag.toLowerCase();
                                    const isAdded = currentTags.includes(tag);

                                    return (
                                        <button
                                            key={item.tag}
                                            type="button"
                                            disabled={
                                                disabled ||
                                                readOnly ||
                                                isAdded ||
                                                currentTags.length >= maxTags
                                            }
                                            onClick={() => handleAddTag(tag)}
                                            className="flex gap-2 items-center justify-center rounded-full bg-base-100 text-xs px-3 py-1 border border-base-300 cursor-pointer disabled:cursor-default disabled:opacity-50"
                                        >
                                            <span
                                                className="font-nerdfont leading-none"
                                                aria-hidden="true"
                                            >
                                                
                                            </span>

                                            <span className="mb-0.5">
                                                {item.label ?? tag}
                                            </span>

                                            {!isAdded && (
                                                <span
                                                    className="font-nerdfont leading-none text-xs"
                                                    aria-hidden="true"
                                                >
                                                    
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            {!readOnly && currentTags.length < maxTags && (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span
                            className="absolute z-1 font-nerdfont leading-none left-3 top-1/2 -translate-y-1/2 text-sub select-none"
                            aria-hidden="true"
                        >
                            
                        </span>

                        <input
                            ref={inputRef}
                            id={id ? `${id}-input` : undefined}
                            type="text"
                            className="input w-full pl-7 text-sm"
                            placeholder={placeholder}
                            value={tagInput}
                            disabled={disabled}
                            maxLength={maxLength}
                            onChange={(e) =>
                                setTagInput(
                                    e.target.value
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag();
                                }

                                if (
                                    e.key === "Backspace" &&
                                    !tagInput &&
                                    currentTags.length > 0
                                ) {
                                    handleDeleteTag(currentTags.length - 1);
                                }
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        disabled={disabled || !tagInput.trim()}
                        className="btn btn-square btn-accent text-base font-nerdfont cursor-pointer"
                        aria-label="Add tag"
                        onClick={() => handleAddTag()}
                    >
                        
                    </button>
                </div>
            )}

            <div className="text-xs text-sub">
                {currentTags.length}/{maxTags} tags
            </div>
        </div>
    );
}
