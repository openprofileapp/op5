import React from "react";
import { useTranslation } from "react-i18next";

import { AwardNameType, GetAwardType } from "../../../_common/types/award.type.js";
import { Tooltip } from "./Tooltip.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";
import { formatShortRelative } from "../scripts/time.js";

type AwardIndexItem = {
    name: string;
    icon: string;
    color: string;
};

const order: Record<AwardNameType, number> = {
    PRECURSOR: 1,
    CONTRIBUTOR: 2,
    ENTOMOLOGIST: 3
};

const getOrdinal = (n: number | string): string => {
    const num = Number(n);
    if (isNaN(num)) return String(n);
    
    const rule = new Intl.PluralRules("en-US", { type: "ordinal" });
    const suffixes: Record<string, string> = {
        one: "st",
        two: "nd",
        few: "rd",
        other: "th",
    };
    return `${num}${suffixes[rule.select(num)]}`;
};

function AwardItem({
    award,
    index,
}: {
    award: GetAwardType;
    index: AwardIndexItem;
}) {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;

    const tooltipContent = (
        <div className="tooltip-content bg-base-200 text-base-content border border-base-300 rounded shadow-2xl flex flex-col max-w-[300px] text-center p-1">
            <div className="flex flex-col p-1 gap-2">
                <div className="flex flex-col">
                    <div className="font-bold text-sm">{index?.name ?? award.type}</div>
                    {(award.comment || award.date) && (
                        <>
                            <hr className="my-1 border-base-300" />
                            <div className="text-xs text-sub">
                                {award.comment && (
                                    <>
                                        {award.type === "PRECURSOR"
                                            ? `${getOrdinal(award.comment)} ${t("words.Registration")}`
                                            : award.comment
                                        }

                                        {award.type === "ENTOMOLOGIST" &&
                                            `${t("words.Caught")} ${award.comment} ${award.comment === "1" ? t("words.bug") : t("words.bugs") }`
                                        }
                                        <br/>
                                        <br/>
                                    </>
                                )}

                                {award.date && (
                                    <>
                                        {t("words.AwardedOn")}: <strong>{formatShortRelative(award.date)}</strong>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const baseColor = index?.color ?? "#aaaaaa";

    return (
        <Tooltip content={tooltipContent}>
            <div
                className="flex items-center justify-center p-3 rounded border cursor-pointer w-full aspect-square transition-all"
                style={{
                    backgroundColor: `${baseColor}20`,
                    borderColor: `${baseColor}40`,
                }}
            >
                <span
                    className="text-5xl font-nerdfont leading-none flex items-center justify-center"
                    style={{ color: baseColor }}
                >
                    {index?.icon ?? ""}
                </span>
            </div>
        </Tooltip>
    );
}

export default function Awards({
    data
}: { data: GetUserItemType }) {
    const { t, ready: isTranslationReady } = useTranslation();

    const awards: GetAwardType[] = [
        ...(data?.awards || [])
    ];

    if (awards.length === 0) {
        return null;
    }

    const sortedAwards = awards
        .sort((a, b) => (order[a.type] ?? 999) - (order[b.type] ?? 999));

    if (!isTranslationReady) return null;

    const awardIndex: Record<AwardNameType, AwardIndexItem> = {
        CONTRIBUTOR: {
            name: t("components.awards.contributorName"),
            icon: "󰊤",
            color: "#1540cf"
        },
        ENTOMOLOGIST: {
            name: t("components.awards.entomologistName"),
            icon: "",
            color: "#13a10e"
        },
        PRECURSOR: {
            name: t("components.awards.precursorName"),
            icon: "",
            color: "#700cb7"
        },
    };

    return (
        <div className="grid grid-cols-3 gap-4 w-full text-center">
            {sortedAwards.map((award, index) => (
                <AwardItem
                    key={`${award.type}-${index}`}
                    award={award}
                    index={awardIndex[award.type]}
                />
            ))}
        </div>
    );
}
