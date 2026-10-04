/* eslint-disable @typescript-eslint/ban-ts-comment */

import { 
    useRef, 
    useState, 
    useCallback, 
    useEffect, 
    useImperativeHandle, 
    forwardRef 
} from "react";

import { useTranslation } from "react-i18next";

import { Tooltip } from "../../../_common/components/Tooltip.js";
import { FieldNameType, FieldOptionsType } from "../../../../_common/types/field.type.js";
import { SliderInput } from "../../../_common/components/SliderInput.js";
import MarkdownEditor from "../../../_common/components/markdown/Editor.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl } from "../../../_common/scripts/domains.js";
import { CheckboxInput } from "../../../_common/components/CheckboxInput.js";
import { DropdownOptionsType } from "../../../../_common/types/dropdown.type.js";

type Screen = "menu" | "configure";

interface FieldTypeOption {
    type: FieldNameType;
    icon: string;
    title: string;
    description: string;
    comingSoon?: boolean;
}

const index: FieldTypeOption[] = [
    {
        type: "text",
        icon: "󰦨",
        title: "Text",
        description: "Enter single or multi-line markdown-supported text."
    },
    {
        type: "dropdown",
        icon: "",
        title: "Dropdown",
        description: "Write a new or choose existing options from a list."
    },
    {
        type: "slider",
        icon: "",
        title: "Slider",
        description: "Select a value within a range."
    },
    {
        type: "rating",
        icon: "",
        title: "Rating",
        description: "Rate using a custom icon or a score."
    },
    {
        type: "color",
        icon: "󰏘",
        title: "Color",
        description: "Choose a color value such as HEX, RGB, or other formats."
    },
    {
        type: "media",
        icon: "󰋩",
        title: "Media",
        description: "Upload or link a single image or video (coming soon)."
    },
    {
        type: "button",
        icon: "",
        title: "Button",
        description: "Trigger an action or open a link."
    },
    {
        type: "separator",
        icon: "󰡏",
        title: "Separator",
        description: "Insert vertical spacing, horizontal line, or text headers."
    },
    {
        type: "asset",
        icon: "",
        title: "Asset",
        description: "Select an existing asset to define a relationship.",
        comingSoon: true
    },
    {
        type: "calendar",
        icon: "󰃭",
        title: "Calendar",
        description: "Display events, tasks, or routines by day, week, or month.",
        comingSoon: true
    },
    {
        type: "timeline",
        icon: "󰙮",
        title: "Timeline",
        description: "Present events in chronological order along a visual timeline.",
        comingSoon: true
    },
    {
        type: "table",
        icon: "󰓫",
        title: "Table",
        description: "Organize structured grid data with rows and columns.",
        comingSoon: true
    }
];

export interface NewFieldType {
    id: string;
    type: FieldNameType;
    flex: number;
    label: string;
    placeholder?: string;
    options?: FieldOptionsType;
    guide?: string;
}

export interface NewFieldModalOptions {
    targetRowId: string;
    onAddField: (targetRowId: string, data: NewFieldType) => Promise<boolean>;
    resolveDynamicValues?: (
        text: string
    ) => string;
}

export interface NewFieldModalRef {
    open: (options: NewFieldModalOptions) => void;
    close: () => void;
}

const NewFieldModal = forwardRef<NewFieldModalRef>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<NewFieldModalOptions | null>(null);
    const datasetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [screen, setScreen] = useState<Screen>("menu");
    const [isSingletype] = useState(index.length === 0);

    const [id, setId] = useState<string>("");
    const [type, setType] = useState<FieldNameType>("text");
    const [flex, setFlex] = useState<number>(1);
    const [label, setLabel] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>("");
    const [options, setOptions] = useState<FieldOptionsType | undefined>(undefined);
    const [guide, setGuide] = useState<string>("");

    const [datasets, setDatasets] = useState<DropdownOptionsType>([]);
    const [isLoadingDatasets, setIsLoadingDatasets] = useState<boolean>(true);
    const [valueFormatInput, setValueFormatInput] = useState("");

    const resetForm = useCallback(() => {
        optionsRef.current = null;
        setIsOpen(false);
        setScreen("menu");
        setId("");
        setType("text");
        setFlex(0);
        setLabel("");
        setPlaceholder("");
        setOptions(undefined);
        setGuide("");
    }, []);

    useImperativeHandle(ref, () => ({
        open: (modalOptions) => {
            optionsRef.current = modalOptions;
            setIsOpen(true);
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

    function go(fieldType: FieldNameType) {
        setType(fieldType);
        setScreen("configure");
    }

    useEffect(() => {
        const loadDatasets = async () => {
            if (
                type !== "dropdown" &&
                type !== "text"
            ) return

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
    }, [isOpen]);

    async function handleSave() {
        if (!optionsRef.current) return;

        setIsLoading(true);
        try {
            const payload: NewFieldType = {
                id,
                type,
                flex,
                label,
                placeholder,
                options,
                guide,
            };

            const isSuccess = await optionsRef.current.onAddField(
                optionsRef.current.targetRowId, 
                payload
            );

            if (isSuccess) {
                modalRef.current?.close();
            }
        } finally {
            setIsLoading(false);
        }
    }

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={modalRef}
            className="modal"
            id="new-field"
            onClose={resetForm}
        >
            <div className={`
                    modal-box flex flex-col max-h-[650px] 
                    ${index.length > 5 && screen === "menu" 
                        ? "max-w-245" 
                        : type === "button" || type === "separator" 
                            ? "p-0"
                            : "max-w-298 max-h-[90vh] p-0"
                    }
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

                {!isSingletype && screen !== "menu" && (
                    <button
                        type="button"
                        className="absolute left-0 top-1 m-5 flex items-center gap-2 cursor-pointer"
                        onClick={() => setScreen("menu")}
                    >
                        <span className="text-xl font-nerdfont leading-none">
                            
                        </span>

                        <span>Back</span>
                    </button>
                )}

                {screen === "menu" && (
                    <div className="shrink-0 mb-4">
                        <h3 className="font-nerdfont text-6xl text-center mb-4">
                            
                        </h3>

                        <h3 className="text-center text-2xl font-bold">
                            {screen === "menu" ? "New Field" : `New ${index.find((item) => item.type === type)?.title} Field`}
                        </h3>

                        {screen === "menu" && (
                            <p className="text-center text-sm text-sub py-4">
                                What type of field do you want to add?
                            </p>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-y-hidden pr-1">
                    {screen === "menu" && (
                        <div
                            className={`grid gap-2 ${
                                index.length > 5 ? "grid-cols-2" : "grid-cols-1"
                            }`}
                        >
                            {index.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`
                                        btn bg-base-100 border border-base-300 gap-4 h-16
                                        ${item.comingSoon ? "tooltip tooltip-accent cursor-default" : ""}
                                    `}
                                    onClick={() => !item.comingSoon && go(item.type)}
                                    data-tip={item.comingSoon ? "Coming Soon" : ""}
                                >
                                    <div className={`
                                        text-xl w-6 font-nerdfont
                                        ${item.comingSoon ? "opacity-50" : ""}
                                    `}>
                                        {item.icon}
                                    </div>

                                    <div className={`
                                        flex flex-col text-left flex-1
                                        ${item.comingSoon ? "opacity-50" : ""}
                                    `}>
                                        <div>{item.title}</div>

                                        <div className={`
                                            text-xs font-normal
                                            ${item.comingSoon ? "opacity-50" : "text-sub"}
                                        `}>
                                            {item.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {screen === "configure" && (
                        <div className="flex flex-row flex-1 min-w-0 min-h-0">
                            <div className="flex flex-col flex-1 min-w-0 min-h-0 p-6">
                                <div className="mb-6">
                                    <h3 className="font-nerdfont text-center text-6xl mb-4">
                                        
                                    </h3>

                                    <h3 className="text-2xl text-center font-bold">
                                        Configure Block
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-6 py-4 w-full">
                                    <div className="flex flex-col gap-4">
                                        <fieldset className="fieldset w-full max-h-90 overflow-y-auto scrollbar-none">
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
                                                                .replace(/\s+/g, "-")
                                                                .replace(/[^a-z-0-9]/g, "")
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label flex gap-2">
                                                    Placeholder

                                                    <Tooltip content={(
                                                        <div className="flex flex-col gap-2 max-w-120 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                            <div>You can dynamically display field values in placeholders, guides, and other field values by putting its id in brackets as shown below.</div>
                                                            <br/>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name}")}
                                                            </div>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.possessive}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.possessive}")}
                                                            </div>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.pluralize}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.pluralize}")}
                                                            </div>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.lowercase}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.lowercase}")}
                                                            </div>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.uppercase}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.uppercase}")}
                                                            </div>
                                                            <div>
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.titlecase}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.titlecase}")}
                                                            </div>
                                                            <div className="mb-2">
                                                                <code className="bg-base-100 border border-base-300 rounded p-1">{"{display-name.capitalize}"}</code>
                                                                <span className="mx-1.5 font-nerdfont leading-none"></span>
                                                                {/* @ts-ignore */}
                                                                {optionsRef.current?.resolveDynamicValues("{display-name.capitalize}")}
                                                            </div>
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
                                            
                                            {(
                                                type === "text" ||
                                                type === "dropdown"
                                            ) && (
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
                                                (type === "slider"
                                                || type === "rating")
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

                                            {type === "rating" && (
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

                                            {type === "separator" && (
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

                                            {type === "button" && (
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
                                    className="btn btn-accent w-full shrink-0 mt-4"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    <span className={`${isLoading ? "loading" : ""}`}>
                                        {!isLoading ? "Create" : ""}
                                    </span>
                                </button>
                            </div>

                            <aside 
                                className={`
                                    w-170 shrink-0 border-l border-base-300 p-6 flex flex-col bg-black min-h-0
                                    ${(
                                        type === "button"
                                        || type === "separator"
                                    ) 
                                        ? "hidden" 
                                        : ""
                                    }
                                `}
                            >
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
                    )}
                </div>
            </div>
        </dialog>
    );
});

NewFieldModal.displayName = "NewFieldModal";
export default NewFieldModal;
