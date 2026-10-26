import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { WhatIsType } from "../../../_common/types/whatIs.type.js";
import { cdnBaseUrl, mainBaseUrl } from "../scripts/domains.js";

type Props = {
    data: WhatIsType | null | undefined;
    inline?: boolean;
    isNotification?: boolean;
};

export default function Mention({
    data,
    inline,
    isNotification,
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const Wrapper = inline ? "span" : "div";

    if (!isTranslationReady) {
        return null;
    }

    if (!data?.id) {
        return (
            <Wrapper
                className={
                    inline
                        ? "inline-flex items-center align-middle"
                        : "flex items-center justify-center"
                }
            >
                <div
                    className={`
                        ${isNotification ? "mx-2 flex items-center gap-2" : "mention"}
                        flex items-center gap-2
                        ${isNotification ? "rounded-full border border-base-300 bg-transparent px-3 py-1" : ""}
                    `}
                >
                    
                    <span className="font-nerdfont leading-none">
                        
                    </span>

                    <span>{t("words.Private", "Private")}</span>
                </div>
            </Wrapper>
        );
    }

    const auraStyle = data.isAuraEnabled && !isNotification
        ? {
            ["--aura-type" as string]: `aura-${data.auraType || "flow"}`,
            ["--aura-primary" as string]: data.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: data.auraSecondary || "var(--color-accent)",
        }
        : {};

    let rootUrl = "";

    switch (data.type) {
        case "USER":
            rootUrl = "/user";
            break;
        case "CHARACTER":
            rootUrl = "/character";
            break;
        case "COLLECTION":
            rootUrl = "/collection";
            break;
    }

    return (
        <Wrapper
            className={
                inline
                    ? "inline-flex items-center align-middle"
                    : "flex items-center justify-center"
            }
        >
            <div
                className={`
                    ${isNotification ? "mx-2 flex items-center gap-2" : "mention"}
                    ${isNotification ? "" : "aura-effect"}
                    ${isNotification ? "border-1 rounded-full px-3 py-1 border-base-300 bg-transparent" : ""}
                `}
                style={auraStyle}
            >
                <Link
                    className={`
                        group z-1 flex min-w-0 items-center justify-center gap-2
                        leading-none
                        ${isNotification ? "text-base" : "text-xs"}
                    `}
                    to={`${mainBaseUrl}${rootUrl}/${data.primaryUsername || data.id}`}
                >
                    <img
                        className={`
                            flex-shrink-0 rounded-full
                            ${isNotification ? "h-6 w-6" : "h-4 w-4"}
                        `}
                        src={
                            data.avatar
                                ? `${cdnBaseUrl}${data.avatar}`
                                : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`
                        }
                        alt={t("words.avatar")}
                    />

                    <span className="min-w-0 truncate leading-normal py-0.5 group-hover:underline">
                        {data.displayName || data.primaryUsername || data.id}
                    </span>
                </Link>

                {data.isVerified && (
                    <div
                        className="tooltip tooltip-top tooltip-accent relative z-1 font-normal"
                        data-tip={t("words.Verified")}
                    >
                        <a
                            href={`https://${window.config.domains.support}/en-us/article/verification`}
                            aria-label={t("words.Verified")}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg
                                className="text-accent"
                                width={isNotification ? "17" : "15"}
                                height={isNotification ? "17" : "15"}
                                viewBox="0 0 11 11"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0"
                                    fill="currentColor"
                                />
                                <path
                                    d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143"
                                    fill="#ffffff"
                                />
                            </svg>
                        </a>
                    </div>
                )}
            </div>
        </Wrapper>
    );
}
