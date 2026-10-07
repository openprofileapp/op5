import { useTranslation } from "react-i18next";
import { useState, useRef,useImperativeHandle,forwardRef } from "react";

import { toast } from "../../scripts/toast.js";
import { Article } from "../../../../_common/types/article.type.js";

export interface FeedbackModalRef {
    open: (
        data: Article,
        submitFeedback: (feedback: string) => boolean | Promise<boolean>
    ) => void;
    close: () => void;
}

const FeedbackModal = forwardRef<FeedbackModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<Article>();
    const [feedback, setFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const submitFeedbackRef = useRef<
        ((feedback: string) => void | Promise<void>) | null
    >(null);

    useImperativeHandle(
        ref,
        () => ({
            open: (article, submitFeedback) => {
                setData(article);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                submitFeedbackRef.current = submitFeedback;

                setTimeout(() => {
                    dialogRef.current?.showModal();
                }, 0);
            },

            close: () => {
                dialogRef.current?.close();
            },
        }),
        []
    );

    const handleClose = () => {
        dialogRef.current?.close();
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        const trimmedFeedback = feedback.trim();

        if (!trimmedFeedback) {
            return;
        }

        try {
            const response = await submitFeedbackRef.current?.(trimmedFeedback);

            if (response) {
                setFeedback("");
                setData(undefined);
                submitFeedbackRef.current = null;

                handleClose();

                toast.show(
                    "Thanks for your feedback!",
                    {
                        icon: "󰔓",
                        type: "success",
                    },
                );
            } else {
                toast.show(
                    "Failed to send feedback",
                    { type: "error" }
                );
            }
        } catch {
            toast.show(
                "Failed to send feedback",
                { type: "error" }
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTranslationReady || !data) return null;

    return (
        <dialog
            ref={dialogRef}
            className="modal overflow-visible"
        >
            <div className="modal-box overflow-visible">
                <form method="dialog">
                    <button
                        type="button"
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>

                <h3 className="font-bold text-2xl text-center">
                    Feedback
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    Article: {data.title}
                </p>

                <div className="flex flex-col gap-5 pb-4 pt-4">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Feedback should be honest, fair, and constructive,
                            with the goal of improving this article.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󰂚
                        </div>

                        <div>
                            If your feedback is accepted, you will receive a
                            notification.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󰆓
                        </div>

                        <div>
                            Your feedback is saved until the page reloads. You
                            can safely close this to read the article.
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="feedback-description"
                        className="flex flex-col items-start w-full fieldset-legend text-sm font-normal"
                    >
                        Feedback

                        <textarea
                            id="feedback-description"
                            value={feedback}
                            onChange={(event) => {
                                setFeedback(event.target.value);
                            }}
                            className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                            placeholder="How can we improve this article? Is something missing or incorrect?"
                            spellCheck={true}
                            autoCorrect="on"
                            autoCapitalize="sentences"
                        />
                    </label>
                </div>

                <div className="pt-4 flex gap-2 flex-row relative">
                    <button
                        type="button"
                        disabled={!feedback.trim() || isLoading}
                        className="btn flex-1 bg-accent text-white border-accent disabled:opacity-50"
                        onClick={handleSubmit}
                    >
                        <span className={`${isLoading ? "loading" : ""}`}>
                            Send
                        </span>
                    </button>
                </div>
            </div>

            <form
                method="dialog"
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

FeedbackModal.displayName = "FeedbackModal";
export default FeedbackModal;
