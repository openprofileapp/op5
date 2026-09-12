import { useState, useEffect, useRef } from "react";
import { Wheel, ShadeSlider, hsvaToHex, hexToHsva } from "@uiw/react-color";

type Props = {
    value?: string;
    defaultValue?: string;
    onChange?: (color: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    wheelSize?: number;
};

export default function ColorInput({
    value,
    defaultValue = "#000000",
    onChange,
    label,
    className = "",
    placeholder = "#000000",
    disabled = false,
    wheelSize = 160,
}: Props) {
    const [color, setColor] = useState<string>(value ?? defaultValue);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (value !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setColor(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    const hexColor = isValidHex 
        ? (color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color) 
        : "#000000";

    const hsva = hexToHsva(hexColor);

    const handleColorChange = (newHex: string) => {
        const formattedHex = newHex.toUpperCase();
        setColor(formattedHex);
        onChange?.(formattedHex);
    };

    return (
        <div ref={containerRef} className={`flex flex-col gap-1 relative ${className}`}>
            {label && (
                <label className="label text-sm font-medium p-0 mb-1">
                    {label}
                </label>
            )}

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 p-4 bg-base-100 border border-base-300 rounded shadow-2xl flex flex-col gap-3 items-center">
                    <Wheel
                        color={hsva}
                        width={wheelSize}
                        height={wheelSize}
                        onChange={(colorResult) => {
                            handleColorChange(hsvaToHex(colorResult.hsva));
                        }}
                    />

                    <ShadeSlider
                        hsva={hsva}
                        style={{ width: `${wheelSize}px` }}
                        onChange={(newShade) => {
                            handleColorChange(hsvaToHex({ ...hsva, ...newShade }));
                        }}
                    />
                </div>
            )}

            <div className="relative flex items-center w-full border border-base-300 rounded bg-base-100">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="absolute left-0 top-0 bottom-0 z-1 w-16 cursor-pointer shrink-0 rounded overflow-hidden focus:outline-none disabled:cursor-not-allowed"
                    style={{
                        backgroundImage: `linear-gradient(to right, ${hexColor} 0%, transparent 100%)`,
                    }}
                />

                <input
                    type="text"
                    value={color}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="input w-full pl-18 text-sm border-none bg-transparent outline-none focus:outline-none focus:border-none focus:ring-0 rounded-none"
                />
            </div>
        </div>
    );
}
