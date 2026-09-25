import React, { useState, useEffect, useCallback } from "react";

interface Props {
    value?: number;
    defaultValue?: number;
    maxRating?: number;
    onChange?: (value: number) => void;
    unit?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    showValueText?: boolean;
    valueFormat?: ((val: number) => string) | Record<number, string>;
    icon?: "star" | "heart";
    onContextMenu?: (e: React.MouseEvent) => void;
}

export const RatingInput = ({
    value,
    defaultValue = 0,
    maxRating = 5,
    onChange,
    unit = "",
    disabled = false,
    readOnly = false,
    className = "",
    showValueText = true,
    valueFormat,
    icon = "star",
    onContextMenu
}: Props) => {
    const [val, setVal] = useState<number>(value ?? defaultValue);
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const symbol = icon === "heart" ? "" : "";

    useEffect(() => {
        if (value !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVal(value);
        }
    }, [value]);

    const activeRating = hoverRating !== null ? hoverRating : val;

    const handleSelect = (selectedVal: number) => {
        if (disabled || readOnly) return;

        const nextValue = val === selectedVal ? 0 : selectedVal;

        setVal(nextValue);
        onChange?.(nextValue);
    };

    const getFormattedText = useCallback(
        (targetVal: number) => {
            if (typeof valueFormat === "function") {
                return valueFormat(targetVal);
            }

            if (valueFormat && typeof valueFormat === "object") {
                return targetVal in valueFormat
                    ? valueFormat[targetVal]
                    : `${targetVal}${unit}`;
            }

            return `${targetVal} / ${maxRating}${unit}`;
        },
        [valueFormat, unit, maxRating]
    );

    const isInactive = disabled || readOnly;

    return (
        <div 
            className={`flex flex-col gap-1 w-full ${className}`}
            onContextMenu={onContextMenu}
        >
            <div
                className={`relative flex items-center gap-3 w-full h-9 ${
                    disabled ? "opacity-60" : ""
                }`}
            >
                <div
                    className="flex items-center gap-1.5"
                    onMouseLeave={() => {
                        if (!isInactive) {
                            setHoverRating(null);
                        }
                    }}
                >
                    {Array.from({ length: maxRating }, (_, i) => {
                        const starIndex = i + 1;
                        const isFull = activeRating >= starIndex;

                        return (
                            <span
                                key={starIndex}
                                onMouseEnter={() => {
                                    if (!isInactive) {
                                        setHoverRating(starIndex);
                                    }
                                }}
                                onClick={() => handleSelect(starIndex)}
                                className={`
                                    relative text-xl select-none
                                    ${
                                        isInactive
                                            ? "cursor-default"
                                            : "cursor-pointer"
                                    }
                                `}
                            >
                                <span className="font-nerdfont leading-none text-base-300">
                                    {symbol}
                                </span>

                                <span
                                    className={`
                                        absolute left-0 top-0 overflow-hidden
                                        transition-all duration-50
                                        ${isFull ? "w-full" : "w-0"}
                                        ${
                                            icon === "heart"
                                                ? "text-primary"
                                                : "text-premium"
                                        }
                                    `}
                                >
                                    <span className="font-nerdfont leading-none">
                                        {symbol}
                                    </span>
                                </span>
                            </span>
                        );
                    })}
                </div>

                {showValueText && (
                    <span className="text-xs text-sub text-left">
                        {getFormattedText(activeRating)}
                    </span>
                )}
            </div>
        </div>
    );
};
