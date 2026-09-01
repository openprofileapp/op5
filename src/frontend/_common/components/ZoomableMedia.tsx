import { useState, useRef, useEffect, MouseEvent, WheelEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";

interface ZoomableMediaProps {
    src: string;
    alt?: string;
    description?: string;
    credit?: string;
    className?: string;
    style?: object;
}

export default function ZoomableMedia({ 
    src, 
    alt = "Image",
    description,
    credit,
    className = "",
    style = {}
}: ZoomableMediaProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const transformRef = useRef({ scale: 1, x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startPointRef = useRef({ x: 0, y: 0 });

    const applyTransform = (animate = false) => {
        if (!imgRef.current) return;
        const { scale, x, y } = transformRef.current;
        
        imgRef.current.style.transition = animate ? "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)" : "none";
        imgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${scale})`;
 
        if (isDraggingRef.current) {
            imgRef.current.style.cursor = "grabbing";
        } else if (scale > 1) {
            imgRef.current.style.cursor = "zoom-out";
        } else {
            imgRef.current.style.cursor = "zoom-in";
        }
    };

    const updateTransform = (scale: number, x: number, y: number, animate = false) => {
        const clampedScale = Math.min(Math.max(scale, 1), 2.5);
        let targetX = x;
        let targetY = y;

        if (clampedScale === 1) {
            targetX = 0;
            targetY = 0;
            animate = true;
        } else if (imgRef.current) {
            const maxAllowedX = window.innerWidth * 0.8;
            const maxAllowedY = window.innerHeight * 0.8;

            targetX = Math.min(Math.max(x, -maxAllowedX), maxAllowedX);
            targetY = Math.min(Math.max(y, -maxAllowedY), maxAllowedY);
        }

        transformRef.current = { scale: clampedScale, x: targetX, y: targetY };
        requestAnimationFrame(() => applyTransform(animate));
    };

    const openModal = (e: MouseEvent) => {
        e.stopPropagation();
        transformRef.current = { scale: 1, x: 0, y: 0 };
        setIsOpen(true);
    };

    useEffect(() => {
        if (isOpen && dialogRef.current) {
            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
            const animationFrame = requestAnimationFrame(() => {
                setIsAnimating(true);
            });
            return () => cancelAnimationFrame(animationFrame);
        }
    }, [isOpen]);

    const closeModal = (e?: MouseEvent) => {
        if (e) e.stopPropagation();
        if (!isAnimating) return;

        setIsAnimating(false);

        setTimeout(() => {
            dialogRef.current?.close();
            setIsOpen(false);
        }, 250);
    };

    const handleImageClick = (e: MouseEvent) => {
        e.stopPropagation();

        if (hasDraggedRef.current) {
            hasDraggedRef.current = false;
            return;
        }

        const nextScale = transformRef.current.scale === 1 ? 2.5 : 1;
        updateTransform(nextScale, 0, 0, true);
    };

    const handleWheel = (e: WheelEvent) => {
        e.stopPropagation();
        const delta = e.deltaY * -0.0025;
        const nextScale = transformRef.current.scale + delta;
        updateTransform(nextScale, transformRef.current.x, transformRef.current.y);
    };

    const handlePointerDown = (e: PointerEvent) => {
        if (transformRef.current.scale <= 1) return;
        e.stopPropagation();
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startPointRef.current = {
            x: e.clientX - transformRef.current.x,
            y: e.clientY - transformRef.current.y
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        applyTransform();
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        e.stopPropagation();

        const deltaX = Math.abs(e.clientX - startPointRef.current.x - transformRef.current.x);
        const deltaY = Math.abs(e.clientY - startPointRef.current.y - transformRef.current.y);
        
        if (deltaX > 3 || deltaY > 3) {
            hasDraggedRef.current = true;
        }

        updateTransform(
            transformRef.current.scale,
            e.clientX - startPointRef.current.x,
            e.clientY - startPointRef.current.y
        );
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        e.stopPropagation();
        isDraggingRef.current = false;
        applyTransform();
    };

    const hasMetadata = Boolean(description || credit);

    return (
        <>
            <img
                src={src}
                alt={alt}
                className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
                style={style}
                onClick={openModal}
            />

            {isOpen && createPortal(
                <dialog
                    ref={dialogRef}
                    onClose={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                    className={`modal max-w-none max-h-none w-screen h-screen m-0 p-0 border-none outline-none overflow-hidden select-none cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isAnimating 
                            ? "opacity-100 bg-black/90 backdrop:bg-black/90" 
                            : "opacity-0 bg-black/0 backdrop:bg-black/0"
                    }`}
                    onClick={closeModal}
                >
                    <button 
                        type="button"
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-[1000000] text-base-content hover:opacity-80 transition-opacity duration-150"
                        onClick={closeModal}
                    >
                        
                    </button>

                    <div 
                        className="w-full h-full flex flex-col items-center justify-between touch-none overflow-hidden p-6"
                        onWheel={handleWheel}
                    >
                        <div className="flex-1 w-full flex items-center justify-center min-h-0">
                            <img
                                ref={imgRef}
                                src={src}
                                alt={alt}
                                draggable={false}
                                onClick={handleImageClick}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                className={`max-w-[85vw] max-h-[80vh] object-contain will-change-transform cursor-zoom-in transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                    isAnimating ? "scale-100 opacity-100" : "scale-90 opacity-0"
                                }`}
                            />
                        </div>

                        {hasMetadata && (
                            <div 
                                className="z-99999 mt-4 px-6 py-3 bg-black/80 backdrop-blur-md rounded-md max-w-2xl w-full text-center border border-white/10 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {description && (
                                    <p className="text-sm">
                                        {description}
                                    </p>
                                )}

                                {credit && (
                                    <p className="text-sub text-xs">
                                        Credit: {credit}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </dialog>,
                document.body
            )}
        </>
    );
}
