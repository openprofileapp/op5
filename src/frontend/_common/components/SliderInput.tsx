import React, { useState, useEffect, useMemo, useCallback } from "react";

interface Props {
    id?: string;
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    marks?: number | number[];
    onChange?: (value: number) => void;
    unit?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    showValueText?: boolean;
    valueFormat?: ((val: number) => string) | Record<number, string>;
    onContextMenu?: (e: React.MouseEvent) => void;
}

export const SliderInput = ({
    id,
    value,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    marks,
    onChange,
    unit = "",
    disabled = false,
    readOnly = false,
    className = "",
    showValueText = true,
    valueFormat,
    onContextMenu
}: Props) => {
    const markValues = useMemo(() => {
        if (!marks) return null;
        if (Array.isArray(marks)) return marks.sort((a, b) => a - b);

        const count = Math.max(2, marks);
        const interval = (max - min) / (count - 1);
        return Array.from({ length: count }, (_, i) => min + i * interval);
    }, [marks, min, max]);

    const getSnappedValue = useCallback((rawVal: number): number => {
        if (!markValues || markValues.length === 0) return rawVal;
        return markValues.reduce((prev, curr) =>
            Math.abs(curr - rawVal) < Math.abs(prev - rawVal) ? curr : prev
        );
    }, [markValues]);

    const [val, setVal] = useState<number>(() => getSnappedValue(value ?? defaultValue));

    useEffect(() => {
        if (value !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVal(getSnappedValue(value));
        }
    }, [value, getSnappedValue]);

    const handleValueChange = (newVal: number) => {
        const snappedVal = getSnappedValue(newVal);
        setVal(snappedVal);
        onChange?.(snappedVal);
    };

    const percentage = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));

    const getFormattedText = useCallback((targetVal: number) => {
        if (typeof valueFormat === "function") {
            return valueFormat(targetVal);
        }
        if (valueFormat && typeof valueFormat === "object") {
            return targetVal in valueFormat ? valueFormat[targetVal] : (markValues ? "" : `${targetVal}${unit}`);
        }
        return `${targetVal}${unit}`;
    }, [valueFormat, unit, markValues]);

    return (
        <div 
            className={`flex flex-col gap-1 w-full ${className}`}
            id={id}
        >
            <div className={`relative flex flex-col justify-center w-full h-8 ${disabled ? "opacity-60" : ""}`}>
                <div className="absolute left-0 right-0 h-1.5 bg-base-300 rounded-full pointer-events-none overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-75"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <input
                    id={id}
                    type="range"
                    min={min}
                    max={max}
                    step={markValues ? "any" : step}
                    value={val}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if (readOnly) return;

                        handleValueChange(Number(e.target.value));
                    }}
                    onContextMenu={onContextMenu}
                    className={`
                        w-full h-8 appearance-none bg-transparent z-20 focus:outline-none
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:border-none
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-primary
                        [&::-moz-range-thumb]:border-none
                        [&::-moz-range-thumb]:shadow-md
                        ${disabled ? "cursor-not-allowed [&::-webkit-slider-thumb]:cursor-not-allowed" : ""}
                        ${readOnly ? "cursor-default [&::-webkit-slider-thumb]:cursor-default" : "cursor-pointer"}
                    `}
                />
            </div>

            {showValueText && (
                <div className="relative w-full px-2 mt-1">
                    {markValues && markValues.length > 0 ? (
                        <div className="flex justify-between items-center text-xs">
                            {markValues.map((mark) => {
                                const text = getFormattedText(mark);
                                const isActive = val === mark;
                                return (
                                    <span
                                        key={mark}
                                        onClick={() => !disabled && handleValueChange(mark)}
                                        className={`transition-colors text-center cursor-pointer select-none ${
                                            isActive ? "text-primary" : "text-sub"
                                        } ${disabled ? "cursor-not-allowed" : ""}`}
                                    >
                                        {text}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-right text-xs text-sub">
                            {getFormattedText(val)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
