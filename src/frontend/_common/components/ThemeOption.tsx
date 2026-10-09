import { themes } from "../scripts/themes.js";

export default function ThemeOption({
    theme,
    selected,
    disabled = false,
    onSelect,
}: {
    theme: (typeof themes)[number];
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
}) {
    const colors = [
        theme.preview?.background ?? "#00000000",
        theme.preview?.text ?? "#00000000",
        theme.preview?.border ?? "#00000000",
        theme.preview?.accent?.background ?? "#00000000",
    ];

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onSelect}
            className="flex items-center justify-between gap-4"
        >
            <span 
                className="truncate"
                style={{
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    fontFamily: theme?.font
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        ? `"${theme?.font}"`
                        : "Alexandria",
                }}
            >
                {theme.name}
            </span>

            <span className="flex shrink-0 items-center gap-2">
                <span className="flex gap-1 rounded border border-base-300 bg-base-100 p-1">
                    {colors.map((color, index) => (
                        <span
                            key={index}
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </span>

                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                    {selected ? "" : ""}
                </span>
            </span>
        </button>
    );
}
