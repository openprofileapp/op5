import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { BadgeType } from "../../../backend/_common/types/queries/badges.type.js";

type Props = {
    badges?: BadgeType[];
};

export default function Badges({
    badges = []
}: Props) {
    const { ready } = useTranslation();

    if (!ready) return null;

    if (badges && badges.length < 1) {
        return;
    }

    const badgeOrder: Record<string, number> = {
        staff: 1,
        partner: 2,
        verified: 3,
        trusted: 4,
        contributor: 5,
        entomologist: 6,
        precursor: 7,
        premium: 8,
    };

    const sortedBadges = [...badges].sort(
        (a, b) => (badgeOrder[a.type] ?? 999) - (badgeOrder[b.type] ?? 999)
    );

    {/* Display a link for centain badges */}

    return (
        <div className="flex gap-2 h-5 p-3 px-2 text-xs font-normal btn btn-base-200 border-base-300">
            {sortedBadges.map((b) => (
                <span className="relative grid place-items-center tooltip tooltip-accent tooltip-top">
                    <div className="tooltip-content">
                        <div className="font-bold">
                            {(() => {
                                // VERIFY THE IDS ARE CORRECT
                                switch (b.type) {
                                    case "staff":
                                        return "OpenProfile Staff";
                                    case "partner":
                                        return "Partner Program";
                                    case "verified":
                                        return "Verified";
                                    case "trusted":
                                        return "Trusted Illustrator";
                                    case "contributor":
                                        return "Contributor";
                                    case "entomologist":
                                        return "Entomologist";
                                    case "precursor":
                                        return "Precursor";
                                    case "premium":
                                        return "Premium";
                                    default:
                                        return b.type;
                                }
                            })()}
                        </div>
                        {b.comment && (
                            <div className="text-xs">{b.comment}</div>
                        )}
                    </div>

                    {(() => {
                        // VERIFY THE IDS ARE CORRECT
                        switch (b.type) {
                            case "staff":
                                return <span className="text-lg font-nerdfont leading-none text-accent">󱁤</span>;
                            case "partner":
                                return <svg className="text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M11.807 4.318Q9.837 2.587 6.98 3.074q-3.629.619-4.721 4.133t1.538 6.076l7.5 7.428q.293.29.704.29a.96.96 0 0 0 .704-.29l1.805-1.788-2.716-2.716q-.293-.293-.293-.707t.293-.707a.96.96 0 0 1 .707-.293q.414 0 .707.293l2.723 2.723 1.09-1.08-2.727-2.729A.96.96 0 0 1 14 13q0-.414.293-.707A.96.96 0 0 1 15 12q.414 0 .707.293l2.735 2.735 1.09-1.08-2.989-2.99q-1.543-1.543-3.086 0l-1 1q-.978.978-1.957.978-.978 0-1.957-.979L8 11.414q-1.403-1.403-.022-2.806zm9.1 8.175q1.744-2.3.817-5.27-1.093-3.5-4.706-4.124-.7-.121-1.346-.109L9.453 9.96l-.039.04.543.543q.224.225.543.225a.74.74 0 0 0 .543-.225l1-1Q13.268 8.318 15 8.318t2.957 1.225z"/></svg>;
                            case "verified":
                                return <svg className="text-accent" width="16" height="16" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" fill="var(--color-base-200)"/></svg>;
                            case "trusted":
                                return <span className="text-base font-nerdfont leading-none text-accent">󰏘</span>;
                            case "contributor":
                                return <span className="text-base font-nerdfont leading-none text-info"></span>;
                            case "entomologist":
                                return <span className="text-base font-nerdfont leading-none text-success"></span>;
                            case "precursor":
                                return <span className="text-base font-nerdfont leading-none text-[var(--color-precursor)]"></span>;
                            case "premium":
                                return <span className="text-base font-nerdfont leading-none text-[var(--color-premium)]"></span>;
                            default:
                                return <span className="text-base font-nerdfont leading-none"></span>;
                        }
                    })()}
                </span>
            ))}
        </div>
    );
}