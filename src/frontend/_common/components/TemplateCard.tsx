/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cdnBaseUrl } from "../scripts/domains.js";
import { ContextMenuBuilder } from "./ContextMenuBuilder.js";
import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import { Link } from "react-router-dom";

type Props = {
    data: GetTemplateItemType;
    isTrash?: boolean;
};

export default function TemplateCard({
    data,
    isTrash
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    const [isDismissed, setIsDismissed] = useState<boolean>(false);
    const [isDismissedInteractionLoading, setIsDismissedInteractionLoading] = useState<boolean>(false);

    const contextMenuBuilder = ContextMenuBuilder({
        // @ts-ignore
        data,
        isContextMenuOpen,
        setIsContextMenuOpen,
        isDismissed,
        isDismissedInteractionLoading,
        setIsDismissed,
        setIsDismissedInteractionLoading
    });

    if (
        !data.id ||
        !data.owner ||
        !data.owner.id ||
        !isTranslationReady ||
        !contextMenuBuilder ||
        isDismissed
    ) return null;

    const avatarClassList = "mask-graident absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover";

    return (
        <div
            className="character-card relative p-4 shadow-sm cursor-pointer transition-all duration-100"
            style={{border: "1px solid #222222"}}
            onContextMenu={(e) => {
                e.preventDefault();
                setIsContextMenuOpen(true);

                const popover = document.getElementById(
                    `more-dropdown-${data.id}`
                ) as HTMLElement | null;

                if (!popover) return;

                popover.showPopover?.();

                requestAnimationFrame(() => {
                    const rect = popover.getBoundingClientRect();

                    popover.style.left = `${Math.min(
                        e.clientX,
                        window.innerWidth - rect.width - 8
                    )}px`;

                    popover.style.top = `${Math.min(
                        e.clientY,
                        window.innerHeight - rect.height - 8
                    )}px`;
                });
            }}
        >
            {contextMenuBuilder.items([
                contextMenuBuilder.view(),
                contextMenuBuilder.separator(),
                contextMenuBuilder.trash(),
                (Boolean(window.session.user?.isDeveloper) || !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR")) && 
                    contextMenuBuilder.separator(),
                contextMenuBuilder.copyId()
            ].filter(Boolean))}

            {(!isTrash) && 
                contextMenuBuilder.items([
                    contextMenuBuilder.restore(),
                    contextMenuBuilder.separator(),
                    contextMenuBuilder.delete(),
                    contextMenuBuilder.separator(),
                    contextMenuBuilder.copyId()
                ].filter(Boolean))
            }

            <Link 
                to={`/template/${data.id}`}
            >
                <div className="absolute inset-0 group">
                    <img
                        className={avatarClassList}
                        src={`${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt={t("words.avatar")}
                    />
                </div>
                                
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold text-center w-full truncate leading-snug">
                                {data.displayName || data.id}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-8 my-2">{data.about || t("defaults.noTemplateAbout")}</div>            
                </div>
            </Link>
        </div>
    );
}
