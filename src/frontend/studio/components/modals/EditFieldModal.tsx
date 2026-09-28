import {
    useRef,
    useState,
    useCallback,
    useEffect,
    useImperativeHandle,
    forwardRef
} from "react";
import { useTranslation } from "react-i18next";

import {
    FieldNameType,
    FieldOptionsType
} from "../../../../_common/types/field.type.js";

import { Tooltip } from "../../../_common/components/Tooltip.js";
import { SliderInput } from "../../../_common/components/SliderInput.js";
import MarkdownEditor from "../../../_common/components/markdown/Editor.js";
import { DropdownOptionsType } from "../../../../_common/types/dropdown.type.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl } from "../../../_common/scripts/domains.js";
import { CheckboxInput } from "../../../_common/components/CheckboxInput.js";

export interface EditFieldModalChange {
    fieldId: string;
    flex?: number;
    label?: string;
    placeholder?: string;
    options?: FieldOptionsType;
    guide?: string;
}

export interface EditFieldModalOptions {
    type: FieldNameType;
    id: string;
    flex?: number;
    label?: string;
    placeholder?: string;
    options?: FieldOptionsType;
    guide?: string;
    onChange?: (
        field: EditFieldModalChange
    ) => Promise<boolean>;
    resolveDynamicValues?: (
        text: string
    ) => string;
}

export interface EditFieldModalRef {
    open: (options: EditFieldModalOptions) => void;
    close: () => void;
}

const EditFieldModal = forwardRef<EditFieldModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();

    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<EditFieldModalOptions | null>(null);
    const datasetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [id, setId] = useState("");
    const [flex, setFlex] = useState(1);
    const [label, setLabel] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [options, setOptions] = useState<FieldOptionsType | undefined>();
    const [guide, setGuide] = useState("");

    const [datasets, setDatasets] = useState<DropdownOptionsType>([]);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
    const [valueFormatInput, setValueFormatInput] = useState("");

    const resetForm = useCallback(() => {
        optionsRef.current = null;

        setIsOpen(false);
        setId("");
        setFlex(1);
        setLabel("");
        setPlaceholder("");
        setOptions(undefined);
        setGuide("");
        setDatasets([]);
        setIsLoadingDatasets(true);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            open: (modalOptions) => {
                optionsRef.current = modalOptions;

                setIsOpen(true);
                setId(modalOptions.id);
                setFlex(modalOptions.flex ?? 1);
                setLabel(modalOptions.label ?? "");
                setPlaceholder(modalOptions.placeholder ?? "");
                setOptions(modalOptions.options);
                setGuide(modalOptions.guide ?? "");
                setValueFormatInput(() =>
                    Object.entries(optionsRef?.current?.options?.valueFormat ?? {})
                        .map(([key, value]) => `${key}:${value}`)
                        .join("\n")
                );
            },

            close: () => {
                modalRef.current?.close();
            }
        }),
        []
    );

    useEffect(() => {
        const dialogNode = modalRef.current;

        if (isOpen && dialogNode && !dialogNode.open) {
            dialogNode.showModal();
        }
    }, [isOpen]);

    useEffect(() => {
        const loadDatasets = async () => {
            if (optionsRef?.current?.type !== "dropdown") return

            setIsLoadingDatasets(true);

            try {
                const datasetId = options?.dataset;

                if (datasetId) {
                    const [draftResponse, publicResponse] = await Promise.all([
                        fetch(
                            `${apiBaseUrl}/v3/templates/datasets/drafts?id=${encodeURIComponent(datasetId)}`,
                            { credentials: "include" }
                        ),
                        fetch(
                            `${apiBaseUrl}/v3/templates/datasets?id=${encodeURIComponent(datasetId)}`,
                            { credentials: "include" }
                        )
                    ]);

                    const [draftData, publicData] = await Promise.all([
                        draftResponse.json(),
                        publicResponse.json()
                    ]);

                    const draftItems =
                        draftResponse.ok && Array.isArray(draftData.items)
                            ? draftData.items
                            : [];

                    const publicItems =
                        publicResponse.ok && Array.isArray(publicData.items)
                            ? publicData.items
                            : [];

                    setDatasets({
                        Draft: draftItems.map(
                            (item: {
                                id: string;
                                label: string;
                            }) => ({
                                id: item.id,
                                name: item.label
                            })
                        ),
                        Public: publicItems.map(
                            (item: {
                                id: string;
                                label: string;
                            }) => ({
                                id: item.id,
                                name: item.label
                            })
                        )
                    });

                    return;
                }

                const [draftResponse, publicResponse] = await Promise.all([
                    fetch(
                        `${apiBaseUrl}/v3/templates/datasets/drafts`,
                        { credentials: "include" }
                    ),
                    fetch(
                        `${apiBaseUrl}/v3/templates/datasets`,
                        { credentials: "include" }
                    )
                ]);

                const [draftData, publicData] = await Promise.all([
                    draftResponse.json(),
                    publicResponse.json()
                ]);

                const draftDatasets =
                    draftResponse.ok && Array.isArray(draftData.items)
                        ? draftData.items.map(
                            (item: {
                                id: string;
                                label: string;
                            }) => ({
                                id: item.id,
                                name: item.label
                            })
                        )
                        : [];

                const publicDatasets =
                    publicResponse.ok && Array.isArray(publicData.items)
                        ? publicData.items.map(
                            (item: {
                                id: string;
                                label: string;
                            }) => ({
                                id: item.id,
                                name: item.label
                            })
                        )
                        : [];

                setDatasets({
                    Draft: draftDatasets,
                    Public: publicDatasets
                });
            } catch (error) {
                console.error("Failed to fetch datasets:", error);
            } finally {
                setIsLoadingDatasets(false);
            }
        };

        loadDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function handleSave() {
        const onChange = optionsRef.current?.onChange;

        if (!onChange || isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const isSuccess = await onChange({
                fieldId: id,
                flex,
                label,
                placeholder,
                options,
                guide
            });

            if (isSuccess) {
                modalRef.current?.close();
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isTranslationReady) {
        return null;
    }

    return (
        <dialog
            ref={modalRef}
            className="modal"
            id="upload-media"
            onClose={resetForm}
        >
            <div className="modal-box flex flex-row relative w-auto max-w-298 max-h-[90vh] overflow-hidden p-0">
                <button
                    type="button"
                    className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer z-50"
                    onClick={() => modalRef.current?.close()}
                >
                    
                </button>

                <div className="flex flex-col flex-1 min-w-0 min-h-0 p-6">
                    <div className="shrink-0 mb-4">
                        <h3 className="font-nerdfont text-3xl text-center mb-4">
                            
                        </h3>

                        <h3 className="text-center text-2xl font-bold capitalize">
                            Edit Field
                        </h3>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto pr-3">
                        <div className="flex flex-col gap-6 py-2 mx-auto w-116 max-w-full">
                            <fieldset className="fieldset w-full">
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Label
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="What does this field covers?"
                                        value={label}
                                        maxLength={64}
                                        onChange={(e) =>
                                            setLabel(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label flex gap-2">
                                        ID

                                        <Tooltip
                                            content={
                                                <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                    The ID should be human-readable for parsing and migration purposes.
                                                </div>
                                            }
                                        >
                                            <span className="font-nerdfont text-sm">
                                                
                                            </span>
                                        </Tooltip>
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="What is the unique id for this row?"
                                        value={id}
                                        maxLength={64}
                                        onChange={(e) =>
                                            setId(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "_")
                                                    .replace(/[^a-z-]/g, "")
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label flex gap-2">
                                        Placeholder

                                        <Tooltip content={(
                                            <div className="flex flex-col gap-1 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                <div>Use the following varibles to display dynamic data from the character.</div>
                                                <br/>
                                                <div><strong>{"{DISPLAY_NAME}"}:</strong> Alice</div>
                                                <div><strong>{"{DISPLAY_NAME_POSSESSIVE}"}:</strong> Alice's</div>
                                            </div>
                                        )}>
                                            <span className="font-nerdfont text-sm"></span>
                                        </Tooltip>
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="What placeholder should this field have?"
                                        value={placeholder}
                                        onChange={(e) =>
                                            setPlaceholder(e.target.value)
                                        }
                                    />
                                </div>
                                
                                {optionsRef.current?.type === "dropdown" && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            Dataset
                                        </label>

                                        <TypeableDropdownInput
                                            value={
                                                Object.values(datasets)
                                                    .flat()
                                                    .find((item) => String(item.id) === String(options?.dataset))
                                                    ?.name ?? ""
                                            }
                                            options={datasets}
                                            placeholder="Type to filter datasets..."
                                            isLoading={isLoadingDatasets}
                                            isServerSideFiltering={true}
                                            onChange={(id) => {
                                                setIsLoadingDatasets(true);
                                                setDatasets([]);

                                                const datasetId = String(id);

                                                setOptions((prev) => ({
                                                    ...prev,
                                                    dataset: datasetId
                                                }));

                                                if (datasetDebounceRef.current) {
                                                    clearTimeout(datasetDebounceRef.current);
                                                }

                                                datasetDebounceRef.current = setTimeout(async () => {
                                                    try {
                                                        const [draftResponse, publicResponse] = await Promise.all([
                                                            fetch(
                                                                `${apiBaseUrl}/v3/templates/datasets/drafts?q=${encodeURIComponent(datasetId)}`,
                                                                { credentials: "include" }
                                                            ),
                                                            fetch(
                                                                `${apiBaseUrl}/v3/templates/datasets?q=${encodeURIComponent(datasetId)}`,
                                                                { credentials: "include" }
                                                            )
                                                        ]);

                                                        const [draftData, publicData] = await Promise.all([
                                                            draftResponse.json(),
                                                            publicResponse.json()
                                                        ]);

                                                        const draftDatasets = draftResponse.ok
                                                            ? draftData.items.map(
                                                                (item: {
                                                                    id: string;
                                                                    label: string;
                                                                    category: string;
                                                                }) => ({
                                                                    id: item.id,
                                                                    name: item.label
                                                                })
                                                            )
                                                            : [];

                                                        const publicDatasets = publicResponse.ok
                                                            ? publicData.items.map(
                                                                (item: {
                                                                    id: string;
                                                                    label: string;
                                                                    category: string;
                                                                }) => ({
                                                                    id: item.id,
                                                                    name: item.label
                                                                })
                                                            )
                                                            : [];

                                                        setDatasets({
                                                            "Draft": draftDatasets,
                                                            "Public": publicDatasets
                                                        });
                                                    } catch (error) {
                                                        console.error("Failed to fetch datasets:", error);
                                                    } finally {
                                                        setIsLoadingDatasets(false);
                                                    }
                                                }, 300);
                                            }}
                                        />
                                    </div>
                                )}

                                {
                                    (optionsRef.current?.type === "slider"
                                    || optionsRef.current?.type === "rating")
                                && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label flex gap-2">
                                            Value Formats

                                            <Tooltip content={(
                                                <div className="flex flex-col gap-1 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                    <div>Must follow this strict format:</div>
                                                    <br/>
                                                    <div><strong>NUMBER:STRING</strong></div>
                                                    <div>Eg: 1:Example Text</div>
                                                </div>
                                            )}>
                                                <span className="font-nerdfont text-sm"></span>
                                            </Tooltip>
                                        </label>

                                        <textarea
                                            className="textarea w-full resize-none !h-auto min-h-[2.5rem] [field-sizing:content]"
                                            placeholder="What values should the slider switch between?"
                                            value={valueFormatInput}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setValueFormatInput(value);

                                                const record: Record<number, string> = {};

                                                value.split(/\r?\n/).forEach((line) => {
                                                    const match = line.match(/^\s*(\d+):(.+?)\s*$/);

                                                    if (match) {
                                                        const number = Number(match[1]);
                                                        const text = match[2].trim();

                                                        record[number] = text;
                                                    }
                                                });

                                                setOptions((prev) => ({
                                                    ...prev,
                                                    valueFormat: record
                                                }));
                                            }}
                                        />
                                    </div>
                                )}

                                {optionsRef.current?.type === "rating" && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label flex gap-2">
                                            Icon
                                        </label>

                                        <CheckboxInput
                                            label="Use Heart Icons"
                                            checked={options?.icon === "heart"}
                                            onChange={(checked) => {
                                                setOptions((prev) => ({
                                                    ...prev,
                                                    icon: checked ? "heart" : "star"
                                                }));
                                            }}
                                        />
                                    </div>
                                )}

                                {optionsRef.current?.type === "separator" && (
                                    <>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="label flex gap-2">
                                                Type
                                            </label>

                                            <TypeableDropdownInput
                                                value={options?.separator || "spacer"}
                                                options={[
                                                    { id: "spacer", name: "Spacer" },
                                                    { id: "divider", name: "Divider" },
                                                    { id: "header", name: "Header" }
                                                ]}
                                                placeholder={placeholder || "Select or type..."}
                                                typeable={false}
                                                onChange={(value) => {
                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        separator: value
                                                    }));
                                                }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="label flex gap-2">
                                                Text
                                            </label>

                                            <input
                                                type="text"
                                                className="input w-full"
                                                placeholder="What header text should this separator have?"
                                                value={options?.text}
                                                onChange={(e) => {
                                                    setOptions((prev) => ({
                                                        ...prev,
                                                        text: e.target.value
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </>
                                )}

                                {optionsRef.current?.type === "button" && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label flex gap-2">
                                            Link
                                        </label>

                                        <input
                                            type="text"
                                            className="input w-full"
                                            placeholder="What placeholder should this field have?"
                                            value={options?.text}
                                            onChange={(e) => {
                                                setOptions((prev) => ({
                                                    ...prev,
                                                    text: e.target.value
                                                }));
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label flex gap-2">
                                        Flex

                                        <Tooltip
                                            content={
                                                <div className="flex flex-col gap-1 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                    When multiple fields share a row, flex determines how much space each field takes up. For example, if one field is flex 1 and another is flex 2, flex 2 takes up two-thirds of the row. If both fields have the same flex value, they share the space equally.
                                                </div>
                                            }
                                        >
                                            <span className="font-nerdfont text-sm">
                                                
                                            </span>
                                        </Tooltip>
                                    </label>

                                    <SliderInput
                                        value={flex}
                                        min={1}
                                        max={5}
                                        marks={5}
                                        onChange={(value) =>
                                            setFlex(value)
                                        }
                                    />
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-accent w-full mt-4 shrink-0"
                        onClick={handleSave}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>

                <aside className="w-170 shrink-0 border-l border-base-300 p-6 flex flex-col bg-black min-h-0">
                    <div className="shrink-0 mb-4">
                        <h3 className="text-2xl font-bold capitalize">
                            Guide
                        </h3>

                        <h3 className="text-sub text-sm mt-2">
                            This text is used to help the author fill out the field.
                        </h3>
                    </div>

                    <div className="flex-1 min-h-0">
                        <MarkdownEditor
                            initialContent={guide}
                            isEditing={true}
                            isStudioMode={true}
                            onChange={(markdown) => {
                                setGuide(markdown);
                            }}
                            resolveDynamicValues={
                                optionsRef.current?.resolveDynamicValues
                            }
                        />
                    </div>
                </aside>
            </div>
        </dialog>
    );
});

EditFieldModal.displayName = "EditFieldModal";
export default EditFieldModal;
