import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import { CategoryIdType } from "../../../../_common/scripts/categories.js";
import { apiBaseUrl, cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import ImageInput from "../../../_common/components/ImageInput.js";
import { GetBlockItemType, GetTemplateBlockType, TemplateBlockItemType } from "../../../../_common/types/template/block.type.js";

type Screen = "menu" | "configure";

interface NewBlockModalProps {
    onAddBlock: (data: Partial<GetBlockItemType>) => boolean;
    types: CategoryIdType[];
}

export default function NewBlockModal({ onAddBlock, types }: NewBlockModalProps) {
    const { t, ready: isTranslationReady } = useTranslation();
    const modalRef = useRef<HTMLDialogElement>(null);

    const [screen, setScreen] = useState<Screen>("menu");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popularDesc");

    const [selectedItem, setSelectedItem] = useState<GetBlockItemType | null>(null);

    const [icon, setIcon] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");

    const [blocks, setBlocks] = useState<TemplateBlockItemType[]>([]);
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        const dialogEl = modalRef.current;
        if (!dialogEl) return;

        const observer = new MutationObserver(() => {
            setIsOpen(dialogEl.hasAttribute("open"));
        });

        observer.observe(dialogEl, { attributes: true, attributeFilter: ["open"] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() !== debouncedSearchQuery) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsSearching(true);
        }

        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim());
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, debouncedSearchQuery]);

    useEffect(() => {
        if (!isOpen || screen !== "menu") return;

        const controller = new AbortController();

        async function fetchblocks() {
            if (debouncedSearchQuery) {
                setIsSearching(true);
            } else {
                setIsLoading(true);
            }

            try {
                const queryParams = new URLSearchParams({
                    types: types.join(","),
                    q: debouncedSearchQuery,
                    sortBy: sortBy,
                });

                const res = await fetch(`${apiBaseUrl}/v3/templates/blocks?${queryParams.toString()}`, {
                    credentials: "include",
                    signal: controller.signal,
                });

                if (!res.ok) {
                    toast.show("Failed to fetch blocks", { type: "error" });
                    return;
                }

                const json: GetTemplateBlockType = await res.json();

                setBlocks(json.items ?? []);
                setCount(json.count ?? 0);
            } catch (err: unknown) {
                if ((err as Error).name !== "AbortError") {
                    console.error(err);
                }
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        }

        fetchblocks();

        return () => {
            controller.abort();
        };
    }, [isOpen, screen, debouncedSearchQuery, sortBy, types]);

    function handleSelect(item?: GetBlockItemType) {
        setIcon(null);
        if (item) {
            setSelectedItem(item);
            setPreviewUrl(item.icon ? `${cdnBaseUrl}${item.icon}` : "");
            setLabel(item.label || "");
            setDescription(item.description || "");
        } else {
            setSelectedItem({
                icon: "",
                label: "",
                description: "",
                rows: [],
            } as unknown as GetBlockItemType);
            
            setPreviewUrl("");
            setLabel("");
            setDescription("");
        }
        setScreen("configure");
    }

    function resetForm() {
        setScreen("menu");
        setSelectedItem(null);
        setIcon(null);
        setPreviewUrl("");
        setLabel("");
        setDescription("");
        setSearchQuery("");
        setDebouncedSearchQuery("");
        setSortBy("popularDesc");
        setIsOpen(false);
    }

    function handleSave() {
        if (!selectedItem) return;

        const isSuccess = onAddBlock({
            blockId: selectedItem.blockId,
            label: label.trim(),
            description: description.trim(),
            icon: previewUrl ?? null,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            rows: selectedItem?.rows ?? [],
        });

        if (isSuccess) {
            modalRef.current?.close();
            resetForm();
        }
    }

    if (!isTranslationReady) return null;

    const showLoadingState = isLoading || isSearching;

    return (
        <dialog id="new-block" ref={modalRef} className="modal" onClose={resetForm}>
            <div 
                className={`modal-box flex flex-col relative 
                    ${screen === "menu" ? "max-w-245" : "max-w-md"}
                `}
            >
                <form method="dialog">
                    <button
                        type="submit"
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer z-10"
                    >
                        
                    </button>
                </form>

                {screen === "configure" && (
                    <button
                        type="button"
                        className="absolute left-0 top-0 m-5 flex items-center gap-2 cursor-pointer z-10"
                        onClick={() => setScreen("menu")}
                    >
                        <span className="text-xl font-nerdfont leading-none"></span>
                        <span>Back</span>
                    </button>
                )}

                <div className="absolute top-12 left-6 right-6 md:relative md:top-0 md:right-0 md:left-0 pointer-events-none mb-6">
                    <h3 className="font-nerdfont text-6xl text-center mb-4">
                        {screen === "menu" ? "" : ""}
                    </h3>

                    <h3 className="text-center text-2xl font-bold">
                        {screen === "menu" ? "Add New Block" : "Configure Block"}
                    </h3>
                </div>

                {screen === "menu" && (
                    <>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <fieldset className="fieldset flex-1">
                                <legend className="fieldset-legend">Search</legend>
                                <label className="input w-full flex items-center gap-2">
                                    <span className="font-nerdfont text-base"></span>
                                    <input
                                        type="search"
                                        placeholder="Search blocks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </label>
                            </fieldset>

                            <fieldset className="fieldset shrink-0 w-full sm:w-60">
                                <legend className="fieldset-legend">Filter</legend>
                                <TypeableDropdownInput
                                    value={sortBy}
                                    options={[
                                        { id: "popularDesc", name: "Most Popular" },
                                        { id: "popularAsc", name: "Least Popular" },
                                        { id: "newest", name: "Newest First" },
                                        { id: "oldest", name: "Oldest First" },
                                        { id: "nameAsc", name: "Name (A-Z)" },
                                        { id: "nameDesc", name: "Name (Z-A)" }
                                    ]}
                                    placeholder="Filter Results"
                                    typeable={false}
                                    onChange={(id) => setSortBy(id as string)}
                                />
                            </fieldset>
                        </div>

                        {showLoadingState && (
                            <div className="col-span-full py-16 text-center text-sub flex flex-col items-center gap-2">
                                <span className="loading loading-spinner loading-lg"></span>
                                <span>{isSearching ? "Searching blocks..." : "Loading blocks..."}</span>
                            </div>
                        )}

                        {!showLoadingState && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
                                {!searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect()}
                                        className="cursor-pointer border-2 aspect-square h-full w-full border-dashed border-base-300 rounded flex items-center justify-center py-3 transition-colors text-sm opacity-70 hover:opacity-100"
                                    >
                                        <span className="font-nerdfont text-3xl">
                                            
                                        </span>
                                    </button>
                                )}
                                
                                {blocks.map((item) => (
                                    <button
                                        key={item.blockId}
                                        type="button"
                                        className="aspect-square w-full relative flex flex-col justify-between items-center p-4 bg-base-200 hover:bg-[#151515] border border-base-300 rounded cursor-pointer text-center group overflow-hidden"
                                        onClick={() => handleSelect(item)}
                                    >
                                        {item.source === "official" && (
                                            <div className="absolute top-1 left-1">
                                                <span className="flex gap-2 text-xs font-medium rounded-br items-center px-3 py-1.5">
                                                    <span className="font-nerdfont leading-none text-sm">
                                                        󰏔
                                                    </span>

                                                    {formatNumber(item.addedCount || 0).short}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center justify-center my-auto w-full">
                                            {item.icon && (
                                                <img
                                                    className="h-18 w-18 object-contain"
                                                    src={`${cdnBaseUrl}${item.icon}`}
                                                    alt="icon"
                                                />
                                            )}

                                            <span className="text-base font-semibold mt-1">
                                                {item.label}
                                            </span>
                                            {item.description && (
                                                <span className="text-xs text-sub mt-1 line-clamp-4">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}

                                {searchQuery && blocks.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-sub">
                                        {`No blocks found matching "${debouncedSearchQuery}"`}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {screen === "configure" && selectedItem && (
                    <div className="flex flex-col gap-6 py-4 max-w-md mx-auto w-full">
                        <div className="flex flex-col gap-4">
                            <fieldset className="fieldset w-full">
                                <div className="flex flex-col justify-center items-center gap-1 mt-1">
                                    <label className="label self-start">
                                        Icon
                                    </label>

                                    <div className="flex justify-center items-center w-full my-2">
                                        <ImageInput
                                            className="aspect-square h-24 w-24"
                                            value={icon}
                                            defaultUrl={previewUrl}
                                            onChange={(file, base64Url) => {
                                                if (file && file.size > 1 * 1024 * 1024) {
                                                    toast.show("File is too large (1 MB maximum)", { type: "error" });
                                                    return;
                                                }

                                                setIcon(file);
                                                setPreviewUrl(base64Url || "");
                                            }}
                                            accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                                            label="icon"
                                            skipCrop={true}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Label
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="What does this block cover?"
                                        value={label}
                                        maxLength={64}
                                        onChange={(e) => setLabel(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Description
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Add a short description..."
                                        value={description}
                                        maxLength={64}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </fieldset>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn btn-accent w-full mt-2"
                        >
                            Add Block
                        </button>
                    </div>
                )}
            </div>

            <form method="dialog" className="modal-backdrop">
                <button type="submit" />
            </form>
        </dialog>
    );
}
