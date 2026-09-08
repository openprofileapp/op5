import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export type TooltipPosition = 
    | "top" 
    | "bottom" 
    | "left" 
    | "right"
;

type TooltipProps = {
    content: ReactNode;
    children: ReactNode;
    position?: TooltipPosition;
};

export function Tooltip({
    content,
    children,
    position = "top"
}: TooltipProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLSpanElement>(null);
    const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
    const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();

            switch (position) {
                case "bottom":
                    setCoords({
                        top: rect.bottom - 4,
                        left: rect.left + rect.width / 2,
                    });
                    break;
                case "left":
                    setCoords({
                        top: rect.top + rect.height / 2,
                        left: rect.left + 4,
                    });
                    break;
                case "right":
                    setCoords({
                        top: rect.top + rect.height / 2,
                        left: rect.right - 4,
                    });
                    break;
                case "top":
                default:
                    setCoords({
                        top: rect.top + 4,
                        left: rect.left + rect.width / 2,
                    });
                    break;
            }
        }

        enterTimerRef.current = setTimeout(() => {
            setIsHovered(true);
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        }, 100);
    };

    const handleMouseLeave = () => {
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);

        setIsVisible(false);
        exitTimerRef.current = setTimeout(() => {
            setIsHovered(false);
        }, 100);
    };

    const getPortalContainer = (): Element | null => {
        if (typeof document === "undefined") return null;

        const activeDialog = triggerRef.current?.closest("dialog[open], .modal, [role='dialog']");
        return activeDialog || document.body;
    };

    // eslint-disable-next-line react-hooks/refs
    const portalTarget = getPortalContainer();

    const positionClass = {
        top: "tooltip-top",
        bottom: "tooltip-bottom",
        left: "tooltip-left",
        right: "tooltip-right",
    }[position];

    const getTransformClasses = () => {
        switch (position) {
            case "bottom":
                return isVisible
                    ? "opacity-100 translate-y-0 -translate-x-1/2"
                    : "opacity-0 -translate-y-2 -translate-x-1/2";
            case "left":
                return isVisible
                    ? "opacity-100 -translate-x-full -translate-y-1/2"
                    : "opacity-0 -translate-x-[calc(100%-8px)] -translate-y-1/2";
            case "right":
                return isVisible
                    ? "opacity-100 translate-x-0 -translate-y-1/2"
                    : "opacity-0 -translate-x-2 -translate-y-1/2";
            case "top":
            default:
                return isVisible
                    ? "opacity-100 -translate-y-full -translate-x-1/2"
                    : "opacity-0 -translate-y-[calc(100%-8px)] -translate-x-1/2";
        }
    };

    return (
        <span
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            className="relative inline-flex items-center justify-center cursor-pointer focus:outline-none"
        >
            {children}

            {isHovered && portalTarget &&
                createPortal(
                    <div
                        className={`fixed z-[99999] isolate pointer-events-none tooltip tooltip-open ${positionClass} [--tooltip-color:theme(colors.base-200)] transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)] ${getTransformClasses()}`}
                        style={{
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                        }}
                    >
                        {content}
                    </div>,
                    portalTarget
                )}
        </span>
    );
}
