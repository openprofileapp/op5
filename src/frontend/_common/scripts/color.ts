import colors from "tailwindcss/colors";

export const getTextColor = (color: string) => {
    const [name, shade] = color.split("-");

    const colorValue =
        colors[name as keyof typeof colors]?.[
            shade as keyof (typeof colors)[keyof typeof colors]
        ] as string;

    if (!colorValue || typeof colorValue !== "string") {
        return "#1a1a1a";
    }

    const match = colorValue.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/);

    if (!match) {
        return "#1a1a1a";
    }

    const [, l] = match;
    const lightness = Number(l);

    return lightness > 60 ? "#1a1a1a" : "#eaeaea";
};
