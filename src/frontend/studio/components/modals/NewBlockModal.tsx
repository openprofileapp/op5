import { 
    useState, 
    useRef, 
    useEffect, 
    useCallback, 
    useImperativeHandle, 
    forwardRef 
} from "react";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import { CategoryIdType, categories } from "../../../../_common/scripts/categories.js";
import { apiBaseUrl, cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import ImageInput from "../../../_common/components/ImageInput.js";
import { GetBlockItemType, GetBlockType } from "../../../../_common/types/blocks/block.type.js";
import TagInput from "../../../_common/components/TagInput.js";
import BlockPreview from "../BlockPreview.js";

type Screen = "menu" | "configure";

export type NewBlockType = {
    sourceBlockId?: string;
    label?: string;
    description?: string;
    icon?: string | null;
    rows?: unknown[];
    type?: string;
};

export interface NewBlockModalOptions {
    types: CategoryIdType[];
    onAddBlock: (data: NewBlockType) => boolean | Promise<boolean>;
    skipSelect: boolean;
}

export interface NewBlockModalRef {
    open: (options: NewBlockModalOptions) => void;
    close: () => void;
}

const NewBlockModal = forwardRef<NewBlockModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<NewBlockModalOptions | null>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [screen, setScreen] = useState<Screen>("menu");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popularDesc");

    const [selectedBlock, setSelectedBlock] = useState<Partial<GetBlockItemType> | null>(null);

    const [icon, setIcon] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<CategoryIdType>();
    const [tags, setTags] = useState<string[]>([]);

    const [blocks, setBlocks] = useState<GetBlockItemType[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [count, setCount] = useState<number>(0);

    const resetForm = useCallback(() => {
        optionsRef.current = null;
        setIsOpen(false);
        setIsSaving(false);
        setScreen("menu");
        setSelectedBlock(null);
        setIcon(null);
        setPreviewUrl("");
        setLabel("");
        setDescription("");
        setSearchQuery("");
        setDebouncedSearchQuery("");
        setSortBy("popularDesc");
        setBlocks([]);
        setCount(0);
        setType();
        setTags([]);
    }, []);

    useImperativeHandle(ref, () => ({
        open: (modalOptions) => {
            optionsRef.current = modalOptions;
            setIsOpen(true);

            if (modalOptions.skipSelect) {
                setScreen("configure")
            }
        },
        close: () => {
            modalRef.current?.close();
        }
    }), []);

    useEffect(() => {
        const dialogNode = modalRef.current;
        if (isOpen && dialogNode && !dialogNode.open) {
            dialogNode.showModal();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.trim() !== debouncedSearchQuery) {
            setIsSearching(true);
        }

        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim());
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, debouncedSearchQuery]);

    useEffect(() => {
        if (
            !isOpen ||
            screen !== "menu" ||
            !optionsRef.current ||
            optionsRef.current.skipSelect
        ) return;

        const controller = new AbortController();

        async function fetchBlocksAndDrafts() {
            if (debouncedSearchQuery) {
                setIsSearching(true);
            } else {
                setIsLoading(true);
            }

            try {
                const queryParams = new URLSearchParams({
                    types: optionsRef.current?.types.join(",") || "",
                    q: debouncedSearchQuery,
                    sortBy,
                });

                const [blocksRes, draftsRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/v3/blocks?${queryParams.toString()}`, {
                        credentials: "include",
                        signal: controller.signal,
                    }),
                    fetch(`${apiBaseUrl}/v3/blocks/drafts?${queryParams.toString()}`, {
                        credentials: "include",
                        signal: controller.signal,
                    }),
                ]);

                if (!blocksRes.ok || !draftsRes.ok) {
                    toast.show("Failed to fetch blocks", { type: "error" });
                    return;
                }

                const [blocksJson, draftsJson]: [GetBlockType, GetBlockType] =
                    await Promise.all([
                        blocksRes.json(),
                        draftsRes.json(),
                    ]);

                const publishedBlocks = blocksJson.items ?? [];
                const draftBlocks = draftsJson.items ?? [];

                const blocksMap = new Map(
                    publishedBlocks.map((block) => [block.blockId, block])
                );

                for (const draft of draftBlocks) {
                    blocksMap.set(draft.blockId, draft);
                }

                setBlocks([...blocksMap.values()]);
                setCount(blocks.length);
            } catch (err: unknown) {
                if ((err as Error).name !== "AbortError") {
                    console.error(err);
                }
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        }

        fetchBlocksAndDrafts();

        return () => {
            controller.abort();
        };
    }, [isOpen, screen, debouncedSearchQuery, sortBy, blocks.length]);

    function handleSelect(item?: GetBlockItemType) {
        setIcon(null);
        if (item) {
            setSelectedBlock(item);
            setPreviewUrl(item.icon ? `${cdnBaseUrl}${item.icon}` : "");
            setLabel(item?.label || item?.displayName || "");
            setDescription(item?.description || item.about || "");
        } else {
            setSelectedBlock({
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

    async function handleSave() {
        if ((!selectedBlock && !optionsRef.current?.skipSelect) || !optionsRef.current) return;

        setIsSaving(true);

        const blockData: NewBlockType = {
            sourceBlockId: selectedBlock?.blockId,
            label: label.trim(),
            description: description.trim(),
            icon: previewUrl || null,
            type,
            tags
        };

        const isSuccess = await optionsRef.current.onAddBlock(blockData);

        if (isSuccess) {
            modalRef.current?.close();
        } else {
            setIsSaving(false);
        }
    }

    if (!isTranslationReady) return null;

    const showLoadingState = isLoading || isSearching;

    return (
        <dialog
            id="new-block"
            ref={modalRef}
            className="modal"
            onClose={resetForm}
        >
            <div
                className={`
                    modal-box flex flex-col relative max-h-[90vh] overflow-x-hidden
                    ${screen === "menu" ? "max-w-245" : `${optionsRef.current?.skipSelect ? "" : "max-w-398"} p-0`}
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

                {screen === "configure" && !optionsRef.current?.skipSelect && (
                    <button
                        type="button"
                        className="absolute left-0 top-0 m-5 flex items-center gap-2 cursor-pointer z-10"
                        onClick={() => setScreen("menu")}
                    >
                        <span className="text-xl font-nerdfont leading-none">
                            
                        </span>

                        <span>Back</span>
                    </button>
                )}

                {screen === "menu" && (
                    <div className="absolute top-12 left-6 right-6 md:relative md:top-0 md:right-0 md:left-0 pointer-events-none mb-6">
                        {!optionsRef.current?.skipSelect && (
                            <>
                                <h3 className="font-nerdfont text-6xl text-center mb-4">
                                    {screen === "menu" ? "" : ""}
                                </h3>

                                <h3 className="text-center text-2xl font-bold">
                                    Add New Block
                                </h3>
                            </>
                        )}

                        {optionsRef.current?.skipSelect && (
                            <h3 className="text-center text-2xl font-bold">
                                New Block
                            </h3>
                        )}
                    </div>
                )}

                {screen === "menu" && (
                    <>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <fieldset className="fieldset flex-1">
                                <legend className="fieldset-legend">
                                    Search
                                </legend>

                                <label className="input w-full flex items-center gap-2">
                                    <span className="font-nerdfont text-base">
                                        
                                    </span>

                                    <input
                                        type="search"
                                        placeholder="Search blocks..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </label>
                            </fieldset>

                            <fieldset className="fieldset shrink-0 w-full sm:w-60">
                                <legend className="fieldset-legend">
                                    Filter
                                </legend>

                                <TypeableDropdownInput
                                    value={sortBy}
                                    options={[
                                        {
                                            id: "popularDesc",
                                            name: "Most Popular"
                                        },
                                        {
                                            id: "popularAsc",
                                            name: "Least Popular"
                                        },
                                        {
                                            id: "newest",
                                            name: "Newest First"
                                        },
                                        {
                                            id: "oldest",
                                            name: "Oldest First"
                                        },
                                        {
                                            id: "nameAsc",
                                            name: "Name (A-Z)"
                                        },
                                        {
                                            id: "nameDesc",
                                            name: "Name (Z-A)"
                                        }
                                    ]}
                                    placeholder="Filter Results"
                                    typeable={false}
                                    onChange={(id) =>
                                        setSortBy(id as string)
                                    }
                                />
                            </fieldset>
                        </div>

                        {showLoadingState && (
                            <div className="col-span-full py-16 text-center text-sub flex flex-col items-center gap-2">
                                <span className="loading loading-spinner loading-lg" />
                                <span>
                                    {isSearching
                                        ? "Searching blocks..."
                                        : "Loading blocks..."}
                                </span>
                            </div>
                        )}

                        {!showLoadingState && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1 auto-rows-max">
                                {!searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect()}
                                        className="aspect-square w-full min-h-0 min-w-0 cursor-pointer border-2 border-dashed border-base-300 rounded flex items-center justify-center transition-colors text-sm opacity-70 hover:opacity-100"
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
                                        className="aspect-square w-full min-h-0 min-w-0 relative flex flex-col items-center justify-center p-4 bg-base-200 hover:bg-[#151515] border border-base-300 rounded cursor-pointer text-center group overflow-hidden"
                                        onClick={() => handleSelect(item)}
                                    >
                                        {item.source === "official" && (
                                            <div className="absolute top-1 left-1">
                                                <span className="flex gap-2 text-xs font-medium rounded-br items-center px-3 py-1.5">
                                                    <span className="font-nerdfont leading-none text-sm">
                                                        󰏔
                                                    </span>

                                                    {formatNumber(
                                                        item.uses || 0
                                                    ).short}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-col items-center justify-center w-full min-h-0 overflow-hidden">
                                            {item.icon && (
                                                <img
                                                    className="h-16 w-16 shrink-0 object-contain rounded"
                                                    src={`${cdnBaseUrl}${item.icon}`}
                                                    alt="icon"
                                                />
                                            )}

                                            <span className="text-base font-semibold mt-2 line-clamp-2">
                                                {item.displayName ||
                                                    item.blockId}
                                            </span>

                                            {item.about && (
                                                <span className="text-xs text-sub mt-1 line-clamp-4">
                                                    {item.about}
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

                {screen === "configure" &&
                    (selectedBlock || optionsRef.current?.skipSelect) && (
                        <div className="flex flex-row flex-1 min-w-0 min-h-0">
                            <div className="flex flex-col flex-1 min-w-0 min-h-0 p-6">
                                <div className="mb-6">
                                    {!optionsRef.current?.skipSelect && (
                                        <>
                                            <h3 className="font-nerdfont text-center text-6xl mb-4">
                                                
                                            </h3>

                                            <h3 className="text-2xl text-center font-bold">
                                                Configure Block
                                            </h3>
                                        </>
                                    )}

                                    {optionsRef.current?.skipSelect && (
                                        <h3 className="text-2xl font-bold">
                                            New Block
                                        </h3>
                                    )}
                                </div>

                                <div className="flex flex-col gap-6 py-4 w-full">
                                    <div className="flex flex-col gap-4">
                                        <fieldset className="fieldset w-full">
                                            <div className="flex flex-col justify-center items-center gap-1 mt-1">
                                                <label className="label self-start">
                                                    Icon
                                                </label>

                                                <div className="flex justify-center items-center w-full">
                                                    <ImageInput
                                                        className="aspect-square h-24 w-24"
                                                        value={icon}
                                                        defaultUrl={previewUrl}
                                                        onChange={(
                                                            file,
                                                            base64Url
                                                        ) => {
                                                            if (
                                                                file &&
                                                                file.size >
                                                                    1 *
                                                                        1024 *
                                                                        1024
                                                            ) {
                                                                toast.show(
                                                                    "File is too large (1 MB maximum)",
                                                                    {
                                                                        type: "error"
                                                                    }
                                                                );
                                                                return;
                                                            }

                                                            setIcon(file);
                                                            setPreviewUrl(
                                                                base64Url || ""
                                                            );
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
                                                    placeholder="What is the name of your block?"
                                                    value={label}
                                                    maxLength={64}
                                                    onChange={(e) =>
                                                        setLabel(e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">
                                                    Description
                                                </label>

                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    placeholder="What does this block cover?"
                                                    value={description}
                                                    maxLength={64}
                                                    onChange={(e) =>
                                                        setDescription(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            {optionsRef.current?.skipSelect && (
                                                <>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <label className="label">
                                                            Type
                                                        </label>

                                                        <TypeableDropdownInput
                                                            value={type}
                                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                            // @ts-ignore
                                                            options={categories}
                                                            typeable={false}
                                                            onChange={(values) =>
                                                                setType(
                                                                    values as CategoryIdType[]
                                                                )
                                                            }
                                                            placeholder="What type of block is this?"
                                                        />
                                                    </div>

                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <label className="label">
                                                            Tags
                                                        </label>

                                                        <TagInput
                                                            id="tags"
                                                            value={tags}
                                                            onChange={(tags) =>
                                                                setTags(tags)
                                                            }
                                                            maxTags={10}
                                                            minLength={3}
                                                            maxLength={24}
                                                            onInvalid={(message) =>
                                                                toast.show(
                                                                    message,
                                                                    {
                                                                        type: "error"
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </fieldset>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="btn btn-accent w-full mt-2"
                                    >
                                        <span
                                            className={
                                                isSaving ? "loading" : ""
                                            }
                                        >
                                            {optionsRef.current?.skipSelect
                                                ? "Create"
                                                : "Add Block"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {!optionsRef.current?.skipSelect && (
                                <aside className="w-240 shrink-0 border-l border-base-300 p-6 flex flex-col bg-black min-h-0">
                                    <div className="shrink-0 mb-4">
                                        <h3 className="text-2xl font-bold capitalize">
                                            Preview
                                        </h3>
                                    </div>

                                    <div className="flex-1 min-h-0 max-h-[90vh] overflow-y-auto">
                                        <BlockPreview
                                            blockId={selectedBlock?.blockId as string}
                                        />
                                    </div>
                                </aside>
                            )}
                        </div>
                    )}
            </div>
        </dialog>
    );
});

NewBlockModal.displayName = "NewBlockModal";
export default NewBlockModal;
