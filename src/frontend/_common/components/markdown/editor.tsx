import React, { useState, useRef, useEffect, useCallback } from "react";
import { MarkdownRenderer } from "./renderer.js";
import { useTranslation } from "react-i18next";

interface MarkdownEditorProps {
    initialContent?: string;
    isEditing?: boolean;
    onChange?: (val: string) => void;
    className?: string;
}

export default function MarkdownEditor({
    initialContent = "",
    isEditing = false,
    onChange,
    className = "",
}: MarkdownEditorProps) {
    const { t, ready: isTranslationReady } = useTranslation();
    
    const [value, setValue] = useState<string>(initialContent ?? "");
    const [isPreview, setIsPreview] = useState<boolean>(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.max(textarea.scrollHeight, 280)}px`;
        }
    }, []);

    const handleTextChange = (text: string) => {
        setValue(text);
        if (onChange) onChange(text);
    };

    useEffect(() => {
        if (!isPreview && isEditing) {
            requestAnimationFrame(adjustHeight);
        }
    }, [value, isPreview, isEditing, adjustHeight]);

    const insertMarkdown = (prefix: string, suffix: string = "") => {
        const textarea = textareaRef.current;
        const currentContent = value ?? "";

        let start = textarea ? textarea.selectionStart : currentContent.length;
        let end = textarea ? textarea.selectionEnd : currentContent.length;

        if (typeof start !== "number") start = currentContent.length;
        if (typeof end !== "number") end = currentContent.length;

        const hasSelection = start !== end;
        const selectedText = currentContent.substring(start, end);

        let replacement = "";
        let newSelectionStart = start;
        let newSelectionEnd = end;

        if (hasSelection) {
            replacement = `${prefix}${selectedText}${suffix}`;
            newSelectionStart = start + prefix.length;
            newSelectionEnd = end + prefix.length;
        } else {
            replacement = `${prefix}${suffix}`;
            newSelectionStart = start + prefix.length;
            newSelectionEnd = start + prefix.length;
        }

        const newValue =
            currentContent.substring(0, start) + replacement + currentContent.substring(end);

        handleTextChange(newValue);

        setTimeout(() => {
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
            }
        }, 0);
    };

    const handleToolClick = (e: React.MouseEvent, prefix: string, suffix: string = "") => {
        e.preventDefault();
        insertMarkdown(prefix, suffix);
    };

    if (!isEditing) {
        return <MarkdownRenderer
            className={className} 
            content={value?.trim()} 
        />;
    }

    const buttonClassList = "btn flex items-center justify-center bg-base-200 border border-base-300 w-8 h-8 rounded cursor-pointer tooltip font-normal";
    const buttonTextClassList = "font-nerdfont leading-none text-sm";

    if (!isTranslationReady) return null;

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center justify-between border-y border-base-300 px-4 py-3 gap-4">
                <div className="flex items-center gap-2 text-xs text-sub">
                    <button
                        className={buttonClassList}
                        data-tip={t("words.Bold")}
                        onMouseDown={(e) => handleToolClick(e, "**", "**")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Italic")}
                        onMouseDown={(e) => handleToolClick(e, "*", "*")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Underline")}
                        onMouseDown={(e) => handleToolClick(e, "__", "__")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Strikethrough")}
                        onMouseDown={(e) => handleToolClick(e, "~~", "~~")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Heading")}
                        onMouseDown={(e) => handleToolClick(e, "### ")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <div className="relative block bg-base-300 w-[1px] h-8 rounded-full mx-2"></div>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Link")}
                        onMouseDown={(e) => handleToolClick(e, "[", "](https://example.com)")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Image")}
                        onMouseDown={(e) => handleToolClick(e, "![", "](https://cdn.example.com/image.png=128)")}
                    >
                        <span className={buttonTextClassList}>
                            󰋩
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Code")}
                        onMouseDown={(e) => handleToolClick(e, "`", "`")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Quote")}
                        onMouseDown={(e) => handleToolClick(e, "> ")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.List")}
                        onMouseDown={(e) => handleToolClick(e, "- ")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <div className="relative block bg-base-300 w-[1px] h-8 rounded-full mx-2"></div>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Mention")}
                        onMouseDown={(e) => handleToolClick(e, "<@", ">")}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>
                </div>

                <div 
                    className="tooltip"
                    data-tip={t("words.TogglePreview")}
                >
                    <label className="toggle border-base-300 bg-base-200">
                        <input 
                            className="bg-base-content rounded-full"
                            type="checkbox"
                            onChange={(e) => setIsPreview(e.target.checked)}
                        />

                        <span className="flex font-nerdfont leading-none items-center justify-center text-[10px] w-4 h-4">
                            
                        </span>

                        <span className="flex font-nerdfont leading-none items-center justify-center text-[10px] w-4 h-4">
                            󰈈
                        </span>
                    </label>
                </div>
            </div>

            <div className="p-4">
                {!isPreview ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Sometimes, nothing says everything..."
                        rows={1}
                        className="w-full bg-transparent resize-none overflow-hidden outline-none font-mono text-sm text-base-content min-h-[280px]"
                    />
                ) : (
                    <div className="min-h-[280px]">
                        {value?.trim() ? (
                            <MarkdownRenderer content={value?.trim()} />
                        ) : (
                            <span className="text-sub italic text-sm">
                                Sometimes, nothing says everything...
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
