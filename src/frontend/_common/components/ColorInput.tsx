import { useState, useEffect, useRef } from "react";
import {
    Wheel,
    ShadeSlider,
    hsvaToHex,
    hexToHsva,
    hsvaToRgba,
    rgbaToHsva,
    hsvaToHsla,
    hslaToHsva,
    HsvaColor,
} from "@uiw/react-color";

type ColorFormat = "hex" | "rgb" | "hsl";

type Props = {
    id?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (color: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    wheelSize?: number;
    onContextMenu?: (e: React.MouseEvent) => void;
    readOnly: boolean;
};

const parseToHsva = (colorStr: string): HsvaColor => {
    const clean = colorStr.trim().toLowerCase();

    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(clean)) {
        const fullHex = clean.length === 4
            ? `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`
            : clean;
        return hexToHsva(fullHex);
    }

    const rgbMatch = clean.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
    if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        if (r <= 255 && g <= 255 && b <= 255) {
            return rgbaToHsva({ r, g, b, a: 1 });
        }
    }

    const hslMatch = clean.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/);
    if (hslMatch) {
        const [, h, s, l] = hslMatch.map(Number);
        if (h <= 360 && s <= 100 && l <= 100) {
            return hslaToHsva({ h, s, l, a: 1 });
        }
    }

    return { h: 0, s: 0, v: 0, a: 1 };
};

const detectFormat = (str: string): ColorFormat => {
    const clean = str.trim().toLowerCase();
    if (clean.startsWith("rgb")) return "rgb";
    if (clean.startsWith("hsl")) return "hsl";
    return "hex";
};

const formatHsva = (hsvaObj: HsvaColor, format: ColorFormat): string => {
    if (format === "rgb") {
        const { r, g, b } = hsvaToRgba(hsvaObj);
        return `rgb(${r}, ${g}, ${b})`;
    }
    if (format === "hsl") {
        const { h, s, l } = hsvaToHsla(hsvaObj);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
    return hsvaToHex(hsvaObj).toUpperCase();
};

export default function ColorInput({
    id,
    value,
    defaultValue = "#000000",
    onChange,
    label,
    className = "",
    placeholder = "#000000",
    disabled = false,
    wheelSize = 160,
    onContextMenu,
    readOnly
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

    const hsva = parseToHsva(color);
    const hexColor = hsvaToHex(hsva);
    const currentFormat = detectFormat(color);

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        onChange?.(newColor);
    };

    return (
        <div 
            ref={containerRef}
            id={id}
            className={`flex flex-col gap-1 relative ${className}`}
            onContextMenu={onContextMenu}
        >
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
                            const newHsva = { ...hsva, ...colorResult.hsva };
                            handleColorChange(formatHsva(newHsva, currentFormat));
                        }}
                    />

                    <ShadeSlider
                        hsva={hsva}
                        style={{ width: `${wheelSize}px` }}
                        onChange={(newShade) => {
                            const newHsva = { ...hsva, ...newShade };
                            handleColorChange(formatHsva(newHsva, currentFormat));
                        }}
                    />
                </div>
            )}

            <div className="relative flex items-center w-full border border-base-300 rounded bg-base-100">
                <button
                    type="button"
                    disabled={disabled || readOnly}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="absolute left-0 top-0 bottom-0 z-1 w-16 cursor-pointer shrink-0 rounded overflow-hidden focus:outline-none disabled:cursor-default"
                    style={{
                        backgroundImage: `linear-gradient(to right, ${hexColor} 0%, transparent 100%)`,
                    }}
                />

                <input
                    id={id}
                    type="text"
                    value={color}
                    disabled={disabled}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="input w-full pl-18 text-sm border-none bg-transparent outline-none focus:outline-none focus:border-none focus:ring-0 rounded-none"
                />
            </div>
        </div>
    );
}
