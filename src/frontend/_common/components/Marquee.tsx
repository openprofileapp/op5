interface Props {
    primaryText: string;
    secondaryText?: string;
}

export default function Marquee(
    { 
        primaryText, 
        secondaryText = primaryText
    }: Props
) {
    if (!primaryText) return null;

    const rows = [
        { text: secondaryText, direction: "animate-marquee-right" },
        { text: primaryText, direction: "animate-marquee-left" },
        { text: secondaryText, direction: "animate-marquee-right" },
        { text: primaryText, direction: "animate-marquee-left" },
        { text: secondaryText, direction: "animate-marquee-right" },
        { text: primaryText, direction: "animate-marquee-left" },
    ];

    return (
        <>
            <div 
                aria-hidden="true" 
                className="absolute inset-0 flex flex-col justify-center items-center opacity-5 pointer-events-none transform -rotate-12 scale-150 gap-8"
            >
                {rows.map((row, idx) => (
                    <div key={idx} className="overflow-hidden w-full">
                        <div className={`${row.direction} whitespace-nowrap text-8xl font-black uppercase tracking-widest text-base-content`}>
                            <span>{row.text.repeat(2)}</span>
                            <span>{row.text.repeat(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
