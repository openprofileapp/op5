import {
    useRef,
    useState,
    useCallback,
    useEffect,
    useImperativeHandle,
    forwardRef
} from "react";
import { useTranslation } from "react-i18next";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { CategoryIdType, sortedCategories } from "../../../../_common/scripts/categories.js";
import { DropdownOptionsType } from "../../../../_common/types/dropdown.type.js";

export interface EditCategoryModalChange {
    categoryId: string;
    label?: string;
    types?: DropdownOptionsType;
}

export interface EditCategoryModalOptions {
    id: string;
    label?: string;
    types?: DropdownOptionsType;
    onChange?: (
        category: EditCategoryModalChange
    ) => Promise<boolean>;
    resolveDynamicValues?: (
        text: string
    ) => string;
}

export interface EditCategoryModalRef {
    open: (options: EditCategoryModalOptions) => void;
    close: () => void;
}

const EditCategoryModal = forwardRef<EditCategoryModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();

    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<EditCategoryModalOptions | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [id, setId] = useState("");
    const [label, setLabel] = useState("");
    const [types, setTypes] = useState<DropdownOptionsType>([]);

    const resetForm = useCallback(() => {
        optionsRef.current = null;

        setIsOpen(false);
        setId("");
        setLabel("");
        setTypes([]);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            open: (modalOptions) => {
                optionsRef.current = modalOptions;

                setIsOpen(true);
                setId(modalOptions.id);
                setLabel(modalOptions.label ?? "");
                setTypes(modalOptions.types ?? []);
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

    async function handleSave() {
        const onChange = optionsRef.current?.onChange;

        if (!onChange || isLoading) {
            return;
        }

        setIsLoading(true);

        try {
            const isSuccess = await onChange({
                categoryId: id,
                label,
                types
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
                            Edit Category
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
                                        placeholder="What does this category covers?"
                                        value={label}
                                        maxLength={64}
                                        onChange={(e) =>
                                            setLabel(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Block Types
                                    </label>

                                    <TypeableDropdownInput
                                        multiple
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        value={types}
                                        options={sortedCategories}
                                        onChange={(values) => setTypes(values as CategoryIdType[])}
                                        placeholder="What block types should be visible in this category?"
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
            </div>
        </dialog>
    );
});

EditCategoryModal.displayName = "EditCategoryModal";
export default EditCategoryModal;
