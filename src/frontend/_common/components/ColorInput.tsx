import { useState, useEffect } from "react";

type Props = {
    value?: string;
    defaultValue?: string;
    onChange?: (color: string) => void;
    label?: string;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
};

export default function ColorInput({
    value,
    defaultValue = "#000000",
    onChange,
    label,
    className = "",
    placeholder = "#000000",
    disabled = false,
}: Props) {
    const [color, setColor] = useState<string>(value ?? defaultValue);

    useEffect(() => {
        if (value !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setColor(value);
        }
    }, [value]);

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        onChange?.(newColor);
    };

    const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    
    const hexColor = isValidHex 
        ? (color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color) 
        : "#000000";

    return (
        <div className={`flex flex-col gap-1 relative ${className}`}>
            {label && (
                <label className="label text-sm font-medium p-0 mb-1">
                    {label}
                </label>
            )}

            <div className="relative flex items-center w-full border border-base-300 rounded overflow-hidden bg-base-100">
                <div
                    className="absolute left-0 top-0 bottom-0 z-1 w-16 cursor-pointer shrink-0"
                    style={{
                        backgroundImage: `linear-gradient(to right, ${hexColor} 0%, transparent 100%)`,
                    }}
                >
                    <input
                        type="color"
                        value={hexColor}
                        disabled={disabled}
                        onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>

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
