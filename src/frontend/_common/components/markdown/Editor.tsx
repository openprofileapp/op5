import React, { useState, useRef, useEffect, useCallback } from "react";
import { MarkdownRenderer } from "./Renderer.js";
import { useTranslation } from "react-i18next";
import { cdnBaseUrl, mainBaseUrl } from "../../scripts/domains.js";

interface MarkdownEditorProps {
    initialContent?: string;
    isEditing?: boolean;
    onChange?: (val: string) => void;
    onSave?: (val: string) => Promise<void> | void;
    className?: string;
}

export default function MarkdownEditor({
    initialContent = "",
    isEditing = false,
    onChange,
    onSave,
    className = "",
}: MarkdownEditorProps) {
    const { t, ready: isTranslationReady } = useTranslation();
    
    const [value, setValue] = useState<string>(initialContent ?? "");
    const [savedValue, setSavedValue] = useState<string>(initialContent ?? "");
    const [isPreview, setIsPreview] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [history, setHistory] = useState<string[]>([initialContent ?? ""]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const content = initialContent ?? "";
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(content);
        setSavedValue(content);
        setHistory([content]);
        setHistoryIndex(0);
    }, [initialContent]);

    const savedValueChanged = value !== savedValue;

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.max(textarea.scrollHeight, 280)}px`;
        }
    }, []);

    const updateValueWithHistory = (newValue: string) => {
        if (newValue === value) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setValue(newValue);

        if (onChange) onChange(newValue);
    };

    const handleTextChange = (text: string) => {
        updateValueWithHistory(text);
    };

    const handleUndo = useCallback(() => {
        if (isPreview) return;

        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousValue = history[newIndex];
            setHistoryIndex(newIndex);
            setValue(previousValue);
            if (onChange) onChange(previousValue);
        }
    }, [isPreview, history, historyIndex, onChange]);

    const handleRedo = useCallback(() => {
        if (isPreview) return;

        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextValue = history[newIndex];
            setHistoryIndex(newIndex);
            setValue(nextValue);
            if (onChange) onChange(nextValue);
        }
    }, [isPreview, history, historyIndex, onChange]);

    useEffect(() => {
        if (!isPreview && isEditing) {
            requestAnimationFrame(adjustHeight);
        }
    }, [value, isPreview, isEditing, adjustHeight]);

    const insertMarkdown = (prefix: string, suffix: string = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.focus();

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const replacement = `${prefix}${selectedText}${suffix}`;

        const success = document.execCommand("insertText", false, replacement);

        if (!success) {
            const currentContent = value ?? "";
            const newValue = currentContent.substring(0, start) + replacement + currentContent.substring(end);
            handleTextChange(newValue);
        }

        const newCursorStart = start + prefix.length;
        const newCursorEnd = selectedText ? end + prefix.length : newCursorStart;
        
        setTimeout(() => {
            textarea.setSelectionRange(newCursorStart, newCursorEnd);
        }, 0);
    };

    const handleToolClick = (e: React.MouseEvent, prefix: string, suffix: string = "") => {
        e.preventDefault();
        insertMarkdown(prefix, suffix);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentContent = value ?? "";

            const lastLineBreak = currentContent.lastIndexOf("\n", start - 1);
            const currentLine = currentContent.substring(lastLineBreak + 1, start);

            const listMatch = currentLine.match(/^(\s*[-*]\s+)(.*)/);

            if (listMatch) {
                e.preventDefault();

                const prefix = listMatch[1];
                const textAfterPrefix = listMatch[2];

                if (textAfterPrefix.trim() === "") {
                    const newValue =
                        currentContent.substring(0, lastLineBreak + 1) +
                        currentContent.substring(end);

                    handleTextChange(newValue);

                    const targetPos = lastLineBreak < 0 ? 0 : lastLineBreak + 1;
                    setTimeout(() => {
                        if (textarea) {
                            textarea.focus();
                            textarea.setSelectionRange(targetPos, targetPos);
                        }
                    }, 0);
                } else {
                    const nextBullet = `\n${prefix}`;
                    const newValue =
                        currentContent.substring(0, start) +
                        nextBullet +
                        currentContent.substring(end);

                    handleTextChange(newValue);

                    const newCursorPos = start + nextBullet.length;
                    setTimeout(() => {
                        if (textarea) {
                            textarea.focus();
                            textarea.setSelectionRange(newCursorPos, newCursorPos);
                        }
                    }, 0);
                }
            }
        }
    };

    const handleSave = useCallback(async (e?: React.MouseEvent | KeyboardEvent) => {
        if (e) e.preventDefault();
        if (isSaving || !savedValueChanged) return;

        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(value);
            }

            setSavedValue(value);
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, savedValueChanged, onSave, value]);

    const handleGlobalKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const isCmdOrCtrl = e.metaKey || e.ctrlKey;

            if (!isCmdOrCtrl) return;

            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                
                handleSave();

                return;
            }

            if (e.key.toLowerCase() === "z") {
                if (isPreview) return;

                e.preventDefault();

                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }

                return;
            }

            if (e.key.toLowerCase() === "y") {
                if (isPreview) return;

                e.preventDefault();

                handleRedo();
            }
        },
        [handleSave, handleUndo, handleRedo, isPreview]
    );

    if (!isEditing) {
        return <MarkdownRenderer
            className={className} 
            content={value?.trim()} 
        />;
    }

    const buttonClassList = "btn flex items-center justify-center bg-base-200 border border-base-300 w-8 h-8 rounded cursor-pointer tooltip font-normal";
    const buttonTextClassList = "font-nerdfont leading-none text-sm";

    const tableTemplate = "\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n";
    const gridTemplate = `\n<div className="grid grid-cols-2 gap-4">\n  <div>\n\n![Image Description](${cdnBaseUrl}${window.config.metadata.assets.icon})\n\n  </div>\n  <div>\n\n![Image Description](${cdnBaseUrl}${window.config.metadata.assets.icon})\n\n  </div>\n</div>\n`;

    if (!isTranslationReady) return null;

    return (
        <div 
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleGlobalKeyDown}
            className={`outline-none ${className}`}
        >
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
                        data-tip={t("words.Table")}
                        onMouseDown={(e) => handleToolClick(e, tableTemplate)}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Grid")}
                        onMouseDown={(e) => handleToolClick(e, gridTemplate)}
                    >
                        <span className={buttonTextClassList}>
                            󰋁
                        </span>
                    </button>

                    <div className="relative block bg-base-300 w-[1px] h-8 rounded-full mx-2"></div>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Link")}
                        onMouseDown={(e) => handleToolClick(e, "[", `](${mainBaseUrl})`)}
                    >
                        <span className={buttonTextClassList}>
                            
                        </span>
                    </button>

                    <button
                        className={buttonClassList}
                        data-tip={t("words.Image")}
                        onMouseDown={(e) => handleToolClick(e, "![Image Description", `](${cdnBaseUrl}${window.config.metadata.assets.icon}=256)`)}
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

                <div className="flex items-center gap-4 text-xs text-sub">
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

                    <button
                        className={`btn flex items-center justify-center border w-24 h-8 rounded font-normal gap-2 transition-colors ${
                            !savedValueChanged 
                                ? "bg-base-200 border-base-300 cursor-not-allowed" 
                                : "bg-success border-success cursor-pointer"
                        }`}
                        onClick={handleSave}
                        disabled={isSaving || !savedValueChanged}
                    >
                        <span className={`${buttonTextClassList} ${isSaving ? "loading w-5 h-5" : ""}`}>
                            {!savedValueChanged && !isSaving ? "" : "󰆓"}
                        </span>
                        {!isSaving && (savedValueChanged ? t("words.Save") : t("words.Saved"))}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                {!isPreview ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onKeyDown={handleKeyDown}
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
