import React, { useState, useEffect, useCallback } from "react";

interface Props {
    value?: number;
    defaultValue?: number;
    maxStars?: number;
    allowHalf?: boolean;
    onChange?: (value: number) => void;
    unit?: string;
    disabled?: boolean;
    className?: string;
    showValueText?: boolean;
    valueFormat?: ((val: number) => string) | Record<number, string>;
    icon?: "star" | "heart";
}

export const RatingInput = ({
    value,
    defaultValue = 0,
    maxStars = 5,
    allowHalf = false,
    onChange,
    unit = "",
    disabled = false,
    className = "",
    showValueText = true,
    valueFormat,
    icon = "star",
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
        if (disabled) return;
        const nextValue = val === selectedVal ? 0 : selectedVal;
        setVal(nextValue);
        onChange?.(nextValue);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
        if (disabled) return;
        if (!allowHalf) {
            setHoverRating(starIndex);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const isLeftHalf = e.clientX - rect.left < rect.width / 2;
        setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
    };

    const getFormattedText = useCallback(
        (targetVal: number) => {
            if (typeof valueFormat === "function") {
                return valueFormat(targetVal);
            }
            if (valueFormat && typeof valueFormat === "object") {
                return targetVal in valueFormat ? valueFormat[targetVal] : `${targetVal}${unit}`;
            }
            return `${targetVal.toFixed(allowHalf ? 1 : 0)} / ${maxStars}${unit}`;
        },
        [valueFormat, unit, allowHalf, maxStars]
    );

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            <div className={`relative flex items-center gap-3 w-full h-9 ${disabled ? "opacity-60" : ""}`}>
                <div
                    className="flex items-center gap-1.5"
                    onMouseLeave={() => !disabled && setHoverRating(null)}
                >
                    {Array.from({ length: maxStars }, (_, i) => {
                        const starIndex = i + 1;
                        const isFull = activeRating >= starIndex;

                        return (
                            <span
                                key={starIndex}
                                onMouseMove={(e) => handleMouseMove(e, starIndex)}
                                onClick={() => handleSelect(hoverRating ?? starIndex)}
                                className={`
                                    relative text-xl select-none
                                    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                                `}
                            >
                                <span className="font-nerdfont leading-none text-base-300">
                                    {symbol}
                                </span>

                                <span
                                    className={`
                                        absolute left-0 top-0 overflow-hidden transition-all duration-50
                                        ${isFull ? "w-full" : "w-0"}
                                        ${icon === "heart" ? "text-primary" : "text-premium"}
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
                    <span className="text-xs text-sub text-center w-8">
                        {getFormattedText(activeRating)}
                    </span>
                )}
            </div>
        </div>
    );
};
