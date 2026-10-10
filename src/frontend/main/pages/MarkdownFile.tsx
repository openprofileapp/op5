import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { cdnBaseUrl, shortlinkBaseUrl, supportBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import MarkdownRenderer from "../../_common/components/markdown/Renderer.js";
import { formatShortRelative } from "../../_common/scripts/time.js";
import { toast } from "../../_common/scripts/toast.js";
import { Article } from "../../../_common/types/article.type.js";
import fetchMarkdownFile from "../../_common/scripts/fetchMarkdownFile.js";

interface Props {
    fileName: string;
}

export default function MarkdownFile({ fileName }: Props) {
    const { ready } = useTranslation();
    const navigate = useNavigate();
    const [file, setFile] = useState<Article | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadFile() {
            try {
                setFile(null);

                const result = await fetchMarkdownFile(fileName);

                if (!result) {
                    navigate("/404", { replace: true });
                    return;
                }

                setFile(result);
            } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                    return;
                }

                console.error("Failed to load file:", error);

                toast.show("Failed to fetch file", {
                    subtext: String(error),
                    type: "error",
                });
            }
        }

        loadFile();

        return () => controller.abort();
    }, [fileName, navigate]);

    if (!ready || !file) return null;

    return (
        <>
            <Metadata 
                title={file.title} 
            />

            <div className="mx-4 my-4 md:mx-48 md:my-8">
                <article className="overflow-hidden rounded-xl border border-base-300 bg-base-100 p-6 md:p-12">
                    {(file.title || file.date || file.updated) && (
                        <>
                            <header className="mb-10">
                                {file.title && (
                                    <h1 className="text-3xl font-bold md:text-4xl">
                                        {file.title}
                                    </h1>
                                )}

                                {file.updated && (
                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
                                        <span className="flex gap-2">
                                            Updated {formatShortRelative(file.updated)}
                                        </span>
                                    </div>
                                )}
                            </header>

                            <hr className="pb-8" />
                        </>
                    )}

                    <MarkdownRenderer
                        content={file.content
                            .replaceAll("{CDN}", cdnBaseUrl)
                            .replaceAll("{SUPPORT}", supportBaseUrl)
                            .replaceAll("{SHORTLINK}", shortlinkBaseUrl)}
                    />
                </article>
            </div>
        </>
    );
}
