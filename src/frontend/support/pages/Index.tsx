import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ArticleItem } from "../../../_common/types/article.type.js";
import { cdnBaseUrl, mainBaseUrl, supportBaseUrl } from "../../_common/scripts/domains.js";
import { toast } from "../../_common/scripts/toast.js";

export default function ArticleIndex() {
    const { ready: isTranslationReady } = useTranslation();
    const [searchParams] = useSearchParams();

    const [search, setSearch] = useState(
        () => searchParams.get("q") ?? "",
    );
    const query = search.trim();

    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadArticles() {
            try {
                const response = await fetch(
                    `${supportBaseUrl}/articles`,
                    { credentials: "include" },
                );

                const responseData = await response.json();

                if (!response.ok) {
                    toast.show("Failed to fetch articles", {
                        subtext: `${
                            responseData.id || ""
                        }${
                            responseData.id ? ": " : ""
                        }${responseData.message ?? ""}`,
                        type: "error",
                    });
                    return;
                }

                setArticles(
                    responseData.filter(
                        (article: ArticleItem) =>
                            // eslint-disable-next-line react-hooks/immutability
                            !normalize(article.group ?? "")
                                .replace(/[\s-]/g, "")
                                .includes("changelog"),
                    ),
                );
            } catch (error) {
                toast.show("Failed to fetch articles", {
                    subtext: String(error),
                    type: "error",
                });

                console.error("Failed to load articles:", error);
                setArticles([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadArticles();
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            if (search.trim()) {
                params.set("q", search);
            } else {
                params.delete("q");
            }

            const queryString = params.toString();
            const nextUrl =
                window.location.pathname +
                (queryString ? `?${queryString}` : "") +
                window.location.hash;

            if (
                nextUrl !==
                window.location.pathname +
                    window.location.search +
                    window.location.hash
            ) {
                window.history.replaceState(
                    window.history.state,
                    "",
                    nextUrl,
                );
            }
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search]);

    function normalize(value: string): string {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    function articleMatches(article: ArticleItem, query: string): boolean {
        const searchableText = normalize([
            article.title ?? "",
            article.group ?? "",
            ...(article.keywords ?? []),
        ].join(" "));

        const queryWords = normalize(query).split(" ").filter(Boolean);

        return queryWords.some((word) => searchableText.includes(word));
    }

    const filteredArticles = useMemo(() => {
        if (!query) return articles;

        const matches = articles.filter((article) =>
            articleMatches(article, query),
        );

        return matches.length > 0 ? matches : articles;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [articles, query]);

    if (!isTranslationReady) return null;

    const cardClass = "card rounded border border-base-300 bg-base-100 hover:bg-base-300/1 cursor-pointer";

    return (
        <div className="min-h-screen bg-base-200">
            <nav className="navbar sticky top-0 z-50 border-b border-base-300 bg-base-100 px-6">
                <Link to={supportBaseUrl}>
                    <img
                        alt="OpenProfile wordmark"
                        className="h-6 w-auto"
                        src={`${cdnBaseUrl}${window.config.metadata.assets.wordmark}`}
                    />
                </Link>

                <div className="ml-auto text-sm">
                    <Link
                        to={mainBaseUrl}
                        className="flex h-8 items-center gap-2"
                    >
                        Leave Support
                        <span className="font-nerdfont text-base">
                            
                        </span>
                    </Link>
                </div>
            </nav>

            <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-16 pt-16 sm:pt-24">
                <header className="mb-8 text-center">
                    <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
                        How can we help you?
                    </h1>

                    <p className="text-base-content/60">
                        Search our support articles or reach out.
                    </p>
                </header>

                <form
                    onSubmit={(event) => event.preventDefault()}
                    className="w-full"
                >
                    <label className="input w-full">
                        <span className="font-nerdfont mr-1 text-base">
                            
                        </span>

                        <input
                            type="search"
                            placeholder="Describe what you are trying to resolve?"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="h-4 w-4 cursor-pointer bg-base-100 font-nerdfont text-base leading-none"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                
                            </button>
                        )}
                    </label>
                </form>

                <section
                    className="mt-8 w-full"
                    aria-live="polite"
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="skeleton h-20 w-full rounded-box"
                                />
                            ))}
                        </div>
                    ) : !query ? (
                        <div className="mx-auto mt-8 max-w-4xl">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className={cardClass}>
                                    <div 
                                        className="card-body items-center text-center tooltip cursor-default opacity-50"
                                        data-tip="Coming Soon"
                                    >
                                        <div className="font-nerdfont leading-none text-4xl">
                                            
                                        </div>

                                        <div className="mt-2 text-base font-bold">
                                            Ask Alice

                                            <p className="text-sm text-sub font-normal mt-1">
                                                Support assistant
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={window.config.metadata.urls.discord.main as unknown as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cardClass}
                                >
                                    <div className="card-body items-center text-center tooltip">
                                        <div className="font-nerdfont leading-none text-4xl">
                                            
                                        </div>

                                        <div className="mt-2 text-base font-bold">
                                            Join our Discord

                                            <p className="text-sm text-sub font-normal mt-1">
                                                Community support
                                            </p>
                                        </div>
                                    </div>
                                </a>

                                <a
                                    href={`mailto:${window.config.metadata.contact.support}`}
                                    className={cardClass}
                                >
                                    <div className="card-body items-center text-center tooltip">
                                        <div className="font-nerdfont leading-none text-4xl">
                                            󰇮
                                        </div>

                                        <div className="mt-2 text-base font-bold">
                                            Contact Us

                                            <p className="text-sm text-sub font-normal mt-1">
                                                Email
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    ) : filteredArticles.length > 0 ? (
                        <>
                            <p className="mb-4 text-sm text-base-content/60">
                                {filteredArticles.length}{" "}
                                {filteredArticles.length === 1
                                    ? "result"
                                    : "results"}
                            </p>

                            <div className="space-y-3">
                                {filteredArticles.map((article) => (
                                    <Link
                                        key={article.slug}
                                        to={`/en-us/article/${article.slug}`}
                                        className={cardClass}
                                    >
                                        <div className="card-body flex-row items-center justify-between gap-4 p-5">
                                            <div>
                                                <h2 className="card-title text-base">
                                                    {article.title}
                                                </h2>

                                                {article.group && (
                                                    <div className="mt-2 text-sub text-xs">
                                                        {article.group}
                                                    </div>
                                                )}
                                            </div>

                                            <span className="font-nerdfont text-base leading-none">
                                                
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <h2 className="text-lg font-semibold">
                                No articles found
                            </h2>
                            <p className="mt-2 text-sm text-base-content/60">
                                Try different wording or check your spelling.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
