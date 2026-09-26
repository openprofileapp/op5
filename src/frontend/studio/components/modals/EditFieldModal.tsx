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
    onChange?: (field: EditFieldModalChange) => Promise<boolean>;
}

export interface EditFieldModalRef {
    open: (options: EditFieldModalOptions) => void;
    close: () => void;
}

const EditFieldModal = forwardRef<EditFieldModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();

    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<EditFieldModalOptions | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [id, setId] = useState("");
    const [flex, setFlex] = useState(1);
    const [label, setLabel] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [options, setOptions] = useState<FieldOptionsType | undefined>();
    const [guide, setGuide] = useState("");

    const resetForm = useCallback(() => {
        optionsRef.current = null;

        setIsOpen(false);
        setId("");
        setFlex(1);
        setLabel("");
        setPlaceholder("");
        setOptions(undefined);
        setGuide("");
    }, []);

    useImperativeHandle(ref, () => ({
        open: (modalOptions) => {
            optionsRef.current = modalOptions;

            setIsOpen(true);
            setId(modalOptions.id);
            setFlex(modalOptions.flex ?? 1);
            setLabel(modalOptions.label ?? "");
            setPlaceholder(modalOptions.placeholder ?? "");
            setOptions(modalOptions.options);
            setGuide(modalOptions.guide ?? "");
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

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={modalRef}
            className="modal"
            id="upload-media"
            onClose={resetForm}
        >
            <div className="modal-box flex flex-row relative max-w-300 overflow-hidden p-0">
                <div className="flex flex-col p-6">
                    <button
                        type="button"
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer z-10"
                        onClick={() => modalRef.current?.close()}
                    >
                        
                    </button>

                    <div className="shrink-0 mb-4">
                        <h3 className="font-nerdfont text-3xl text-center mb-4">
                            
                        </h3>

                        <h3 className="text-center text-2xl font-bold capitalize">
                            Edit Field
                        </h3>
                    </div>

                    <div className="flex flex-col gap-6 py-2 mx-auto w-120">
                        <fieldset className="fieldset w-full">
                            <div className="flex flex-col gap-1 mt-1">
                                <label className="label">
                                    Label
                                </label>

                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder={"What does this field covers?"}
                                    value={label ?? ""}
                                    maxLength={64}
                                    onChange={(e) =>
                                        setLabel(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                                <label className="label flex gap-2">
                                    ID

                                    <Tooltip content={(
                                        <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                            The ID should be human-readable for parsing and migration purposes.
                                        </div>
                                    )}>
                                        <span className="font-nerdfont text-sm"></span>
                                    </Tooltip>
                                </label>

                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder={"What is the unique id for this row?"}
                                    value={id ?? ""}
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
                                    placeholder={"What placeholder should this field have?"}
                                    value={placeholder ?? ""}
                                    onChange={(e) =>
                                        setPlaceholder(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                                <label className="label flex gap-2">
                                    Flex

                                    <Tooltip content={(
                                        <div className="flex flex-col gap-1 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                            When multiple fields share a row, flex determines how much space each field takes up. For example, if one field is flex 1 and another is flex 2, flex 2 takes up two-thirds of the row. If both fields have the same flex value, they share the space equally.
                                        </div>
                                    )}>
                                        <span className="font-nerdfont text-sm"></span>
                                    </Tooltip>
                                </label>

                                <SliderInput
                                    value={flex}
                                    min={1}
                                    max={5}
                                    marks={5}
                                    onChange={(value) => setFlex(value)}
                                />
                            </div>
                        </fieldset>

                        <button
                            type="button"
                            className="btn btn-accent w-full mt-2"
                            onClick={handleSave}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </div>

                <aside className="w-168 shrink-0 border-l border-base-300 p-6 flex flex-col bg-black">
                    <div className="shrink-0 mb-4">
                        <h3 className="text-2xl font-bold capitalize">
                            Guide
                        </h3>

                        <h3 className="text-sub text-sm mt-2">
                            This text is used to help the author fill out the field.
                        </h3>
                    </div>

                    <MarkdownEditor
                        initialContent={guide}
                        isEditing={true}
                        onChange={(markdown) => {
                            setGuide(markdown);
                        }}
                    />
                </aside>
            </div>
        </dialog>
    );
});

EditFieldModal.displayName = "EditFieldModal";
export default EditFieldModal;
