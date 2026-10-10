import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { formatNumber } from "kage-library/client";

import { apiBaseUrl, cdnBaseUrl, mainBaseUrl, shortlinkBaseUrl, supportBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import MarkdownRenderer from "../../_common/components/markdown/Renderer.js";
import { formatShortRelative } from "../../_common/scripts/time.js";
import { toast } from "../../_common/scripts/toast.js";
import { Article, ArticleItem, ArticleGroup } from "../../../_common/types/article.type.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";

function getIcon(name: string) {
    switch (name.toLowerCase()) {
        case "change logs": return "";
        case "legal": return "";
        default: return "";
    }
}

function getGroups(
    articles: ArticleItem[],
): {
    ungrouped: ArticleItem[];
    grouped: ArticleGroup[];
} {
    const grouped = new Map<string, ArticleItem[]>();
    const ungrouped: ArticleItem[] = [];

    for (const article of articles) {
        if (!article.group) {
            ungrouped.push(article);
            continue;
        }

        if (!grouped.has(article.group)) {
            grouped.set(article.group, []);
        }

        grouped.get(article.group)!.push(article);
    }

    return {
        ungrouped,

        grouped: Array.from(grouped.entries()).map(
            ([name, articles]) => ({
                name,
                articles,
            }),
        ),
    };
}

function matchesArticle(article: ArticleItem, query: string): boolean {
    if (!query) return true;

    return (
        article.title.toLowerCase().includes(query) ||
        (article.keywords ?? []).some((keyword) =>
            keyword.toLowerCase().includes(query)
        )
    );
}

function ArticleNavItem({
    article,
    currentSlug,
}: {
    article: ArticleItem;
    currentSlug: string;
}) {
    const isActive =
        article.slug === currentSlug;

    return (
        <li>
            <Link
                className="flex items-center gap-4"
                to={`/en-us/article/${article.slug}`}
            >
                <span
                    className={`
                        ${
                            isActive
                                ? "text-accent"
                                : ""
                        }
                        flex h-8 items-center justify-center
                        is-drawer-close:hidden text-sm
                    `}
                >
                    {article.title}
                </span>
            </Link>
        </li>
    );
}

export default function Article() {
    const { "*": slug } = useParams<{ "*": string }>();
    const { t, ready: isTranslationReady } = useTranslation();
    const { feedbackModal } = useModals();
    const navigate = useNavigate();

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [isPositiveFeedbackLoading, setIsPositiveFeedbackLoading] = useState<boolean>(false);
    const [isNegativeFeedbackLoading, setIsNegativeFeedbackLoading] = useState<boolean>(false);

    const [query, setQuery] =  useState("");

    const [articles, setArticles] = useState<ArticleItem[]>([]);

    const [article, setArticle] = useState<Article | null>(null);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [articleLoading, setArticleLoading] =  useState(false);

    const [viewCount, setViewCount] = useState<number>(0);
    const [isHelpful, setIsHelpful] = useState<number | null>(null);
    const [totalHelpful, setTotalHelpful] = useState<number>(0);

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
        () => ({
            "Change Logs": true,
        }),
    );

    useEffect(() => {
        async function loadArticles() {
            try {
                setArticlesLoading(true);

                const response = await fetch(
                    `${supportBaseUrl}/articles`, 
                    { credentials: "include" }
                );

                const responseData = await response.json();

                if (response.ok) {
                    setArticles(responseData);
                } else {
                    toast.show(
                        "Failed to fetch articles", 
                        { 
                            subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                            type: "error" 
                        }
                    );
                }
            } catch (error) {
                toast.show(
                    "Failed to fetch articles", 
                    { 
                        subtext: String(error),
                        type: "error" 
                    }
                );

                console.error(
                    "Failed to load articles:",
                    error,
                );

                setArticles([]);
            } finally {
                setArticlesLoading(false);
            }
        }

        loadArticles();
    }, []);

    useEffect(() => {
        if (!slug) {
            setArticle(null);
            return;
        }

        async function loadArticle() {
            try {
                setArticleLoading(true);

                const response = await fetch(
                    `${supportBaseUrl}/articles/${encodeURI(slug || "")}`,
                    { credentials: "include" }
                );

                const responseData = await response.json();

                if (!response.ok) {
                    if ( response.status === 404) {
                        navigate("/", { replace: true });
                    } else {
                        toast.show(
                            "Failed to fetch article", 
                            { 
                                subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                type: "error" 
                            }
                        );
                    }
                }

                setArticle(responseData);
            } catch (error) {
                toast.show(
                    "Failed to fetch article", 
                    { 
                        subtext: String(error),
                        type: "error" 
                    }
                );

                console.error(
                    "Failed to load article:",
                    error,
                );

                setArticle(null);
            } finally {
                setArticleLoading(false);
            }
        }

        loadArticle();
    }, [navigate, slug]);

    useEffect(() => {
        if (!slug) {
            setViewCount(0);
            return;
        }

        async function handleViewCount() {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/articles/views`,
                    { 
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            article: encodeURI(slug || "")
                        })
                    }
                );

                const responseData = await response.json();

                if (!response.ok) {
                    toast.show(
                        "Failed to fetch views", 
                        { 
                            subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                            type: "error" 
                        }
                    );
                }

                setViewCount(responseData.viewCount);
            } catch (error) {
                toast.show(
                    "Failed to fetch views", 
                    { 
                        subtext: String(error),
                        type: "error" 
                    }
                );

                console.error(
                    "Failed to load views:",
                    error,
                );

                setViewCount(0);
            }
        }

        handleViewCount();
    }, [slug]);

    useEffect(() => {
        if (!slug) {
            setIsHelpful(null);
            setTotalHelpful(0);
            return;
        }

        async function handleVotes() {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/articles/votes`,
                    { 
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            article: encodeURI(slug || ""),
                            action: "GET"
                        })
                    }
                );

                const responseData = await response.json();

                if (!response.ok) {
                    toast.show(
                        "Failed to fetch votes", 
                        { 
                            subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                            type: "error" 
                        }
                    );
                }

                setIsHelpful(responseData.isHelpful);
                setTotalHelpful(responseData.totalHelpful);
            } catch (error) {
                toast.show(
                    "Failed to fetch votes", 
                    { 
                        subtext: String(error),
                        type: "error" 
                    }
                );

                console.error(
                    "Failed to load votes:",
                    error,
                );

                setIsHelpful(null);
                setTotalHelpful(0);
            }
        }

        handleVotes();
    }, [slug]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant",
        });
    }, [slug]);

    const groups = useMemo(
        () => getGroups(articles),
        [articles],
    );

    const currentArticle = articles.find(
        (item) => item.slug === slug,
    );

    const currentGroup = currentArticle?.group;
    const normalizedQuery = query.trim().toLowerCase();

    const filteredUngrouped = groups.ungrouped.filter((item) =>
        matchesArticle(item, normalizedQuery)
    );

    const filteredGroups = groups.grouped
        .map((group) => ({
            ...group,
            articles: group.articles.filter((item) =>
                matchesArticle(item, normalizedQuery)
            ),
        }))
        .filter((group) => group.articles.length > 0);

    const currentIndex =
        articles.findIndex(
            (item) =>
                item.slug === slug,
        );

    const previousArticle =
        currentIndex > 0
            ? articles[currentIndex - 1]
            : undefined;

    const nextArticle =
        currentIndex >= 0 &&
        currentIndex <
            articles.length - 1
            ? articles[currentIndex + 1]
            : undefined;

    function handleGroupToggle(
        group: string,
        event: React.SyntheticEvent<HTMLDetailsElement>,
    ) {
        const details =
            event.nativeEvent.target as
                HTMLDetailsElement;

        setCollapsedGroups(
            (current) => ({
                ...current,
                [group]: !details.open,
            }),
        );
    }

    async function handleHelpful() {
        setIsPositiveFeedbackLoading(true);

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/articles/votes`,
                { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        article: encodeURI(slug || ""),
                        isHelpful: 1,
                        action: "POST"
                    })
                }
            );

            const responseData = await response.json();

            if (response.ok) {
                if (isHelpful !== 1) {
                    toast.show(
                        "Thanks for your feedback!",
                        {
                            icon: "󰔓",
                            type: "success",
                        },
                    );
                } else {
                    toast.show(
                        "You removed your feedback",
                        {
                            icon: "",
                            type: "info",
                        },
                    );
                }
            } else {
                toast.show(
                    "Failed to vote", 
                    { 
                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                        type: "error" 
                    }
                );
            }

            setIsHelpful(responseData.isHelpful);
            setTotalHelpful(responseData.totalHelpful);
        } catch (error) {
            toast.show(
                "Failed to vote", 
                { 
                    subtext: String(error),
                    type: "error" 
                }
            );

            console.error(
                "Failed to vote:",
                error,
            );

            setIsHelpful(null);
            setTotalHelpful(0);
        } finally {
            setIsPositiveFeedbackLoading(false);
        }
    }

    async function submitFeedback(text: string): Promise<boolean> {
        setIsNegativeFeedbackLoading(true);

        try {
            const voteResponse = await fetch(
                `${apiBaseUrl}/v3/articles/votes`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        article: encodeURI(slug || ""),
                        isHelpful: 0,
                        action: "POST",
                    }),
                },
            );

            const voteData = await voteResponse.json();

            if (!voteResponse.ok) {
                toast.show(
                    "Failed to vote",
                    {
                        subtext: `${voteData.id || ""}${
                            voteData.id ? ": " : ""
                        }${voteData.message || ""}`,
                        type: "error",
                    },
                );

                return false;
            }

            if (isHelpful === 0) {
                toast.show(
                    "You removed your feedback",
                    {
                        icon: "",
                        type: "info",
                    },
                );
            }

            if (isHelpful !== 0) {
                const feedbackResponse = await fetch(
                    `${apiBaseUrl}/v3/articles/feedback`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            article: encodeURI(slug || ""),
                            text,
                        }),
                    },
                );

                const feedbackData = await feedbackResponse.json();

                if (!feedbackResponse.ok) {
                    toast.show(
                        "Failed to send feedback",
                        {
                            subtext: `${feedbackData.id || ""}${
                                feedbackData.id ? ": " : ""
                            }${feedbackData.message || ""}`,
                            type: "error",
                        },
                    );

                    return false;
                }
            }

            setIsHelpful(voteData.isHelpful);
            setTotalHelpful(voteData.totalHelpful);

            return true;
        } catch (error) {
            toast.show(
                "Failed to send feedback",
                {
                    subtext: String(error),
                    type: "error",
                },
            );

            console.error("Failed to send feedback:", error);

            setIsHelpful(null);
            setTotalHelpful(0);

            return false;
        } finally {
            setIsNegativeFeedbackLoading(false);
        }
    }

    if (!isTranslationReady || !article || !articles) return null;

    const metadata = {
        title: article?.title,
        author: article?.author?.replaceAll("{SHORTLINK}", shortlinkBaseUrl),
        date: article?.date,
        updated: article?.updated,
    };

    return (
        <>
            <Metadata
                title={metadata.title}
            />

            <div className="drawer lg:drawer-open">
                <input
                    id="my-drawer"
                    type="checkbox"
                    checked={drawerOpen}
                    onChange={(event) =>
                        setDrawerOpen(
                            event.target.checked,
                        )
                    }
                    className="drawer-toggle"
                />

                <div className="drawer-content border-l border-base-300">
                    <nav className="navbar sticky top-0 z-50 w-full border-b border-base-300 bg-base-100">
                        <div className="flex items-center">
                            <label
                                htmlFor="my-drawer"
                                aria-label="open sidebar"
                                className="ml-2 block btn btn-square btn-ghost hover:border-base-100 hover:bg-base-100 md:hidden"
                            >
                                <span className="flex h-8 w-4 items-center justify-center">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </label>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 font-semibold">
                            {metadata.title}
                        </div>

                        <div className="ml-auto mr-2 flex items-center gap-5 text-sm md:mr-4">
                            <Link to={mainBaseUrl}>
                                <span className="flex gap-2 h-8 items-center justify-center">
                                    Leave Support
                                    
                                    <span className="font-nerdfont text-base is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </Link>
                        </div>
                    </nav>

                    <div className="mx-4 my-4 md:mx-16 md:my-8">
                        <article className="overflow-hidden rounded-xl border border-base-300 bg-base-100 p-12">

                            {(
                                metadata.title ||
                                metadata.author ||
                                metadata.date ||
                                metadata.updated
                            ) && (
                                <>
                                    <header className="mb-10">
                                        <h1 className="text-4xl font-bold">
                                            {metadata.title}
                                        </h1>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
                                            {metadata.author && (
                                                <span className="flex gap-1.5">
                                                    By{" "}
                                                    <MarkdownRenderer
                                                        content={
                                                            metadata.author
                                                        }
                                                    />
                                                </span>
                                            )}

                                            {metadata.date && (
                                                <span className="flex gap-2">
                                                    <span className="font-nerdfont">
                                                        
                                                    </span>

                                                    Published{" "}
                                                    {formatShortRelative(
                                                        metadata.date,
                                                    )}
                                                </span>
                                            )}

                                            {metadata.updated &&
                                                metadata.date !==
                                                    metadata.updated && (
                                                    <>
                                                        <span className="font-nerdfont text-xs">
                                                            
                                                        </span>

                                                        <span className="flex gap-2">
                                                            <span className="font-nerdfont">
                                                                
                                                            </span>

                                                            Updated{" "}
                                                            {formatShortRelative(
                                                                metadata.updated,
                                                            )}
                                                        </span>
                                                    </>
                                                )}

                                            <span className="ml-auto flex items-center gap-2">
                                                <span className="font-nerdfont text-lg">
                                                    󰈈
                                                </span>

                                                {formatNumber(viewCount || 0).short} view{viewCount === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                    </header>

                                    <hr className="pb-8" />
                                </>
                            )}

                            <MarkdownRenderer
                                content={
                                    article.content
                                        .replaceAll("{CDN}", cdnBaseUrl)
                                        .replaceAll("{SUPPORT}", supportBaseUrl)
                                        .replaceAll("{SHORTLINK}", shortlinkBaseUrl)
                                }
                            />

                            <footer className="mt-12 border-t border-base-300 pt-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            Was this helpful?
                                        </p>

                                        <p className="mt-1 text-sm text-sub">
                                            {totalHelpful === 0 ? (
                                                <>No one</>
                                            ) : isHelpful === 1 ? (
                                                <>
                                                    You
                                                    {totalHelpful > 1 && (
                                                        <>
                                                            {" "}and {totalHelpful - 1} other{" "}
                                                            {totalHelpful - 1 === 1 ? "person" : "people"}
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {totalHelpful} {totalHelpful === 1 ? "person" : "people"}
                                                </>
                                            )}{" "}
                                            found this helpful
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className={`btn ${isHelpful === 1 ? "btn-success" : ""} gap-2 border border-base-300`}
                                            onClick={handleHelpful}
                                        >
                                            <span className={`font-nerdfont ${isPositiveFeedbackLoading ? "loading h-4 w-4" : ""}`}>
                                                󰔓
                                            </span>

                                            Yes
                                        </button>

                                        <button
                                            type="button"
                                            className={`btn ${isHelpful === 0 ? "btn-error" : ""} gap-2 border border-base-300`}
                                            onClick={() => {
                                                if (isHelpful !== 0) {
                                                    feedbackModal.open(
                                                        article,
                                                        submitFeedback
                                                    );
                                                } else {
                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    submitFeedback();
                                                }
                                            }}
                                        >
                                            <span className={`font-nerdfont ${isNegativeFeedbackLoading ? "loading h-4 w-4" : ""}`}>
                                                󰔑
                                            </span>

                                            No
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </article>

                        <nav className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {previousArticle ? (
                                <Link
                                    to={`/en-us/article/${previousArticle.slug}`}
                                    className="group flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 text-left"
                                >
                                    <div className="text-xs font-medium uppercase tracking-wider text-sub">
                                        Previous
                                    </div>

                                    <div className="flex w-full items-center justify-start gap-2 font-semibold">
                                        <span className="font-nerdfont">
                                            
                                        </span>

                                        {previousArticle.title}
                                    </div>

                                    {previousArticle.group && (
                                        <div className="text-xs text-sub">
                                            {previousArticle.group}
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div />
                            )}

                            {nextArticle ? (
                                <Link
                                    to={`/en-us/article/${nextArticle.slug}`}
                                    className="group flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 text-right"
                                >
                                    <div className="text-xs font-medium uppercase tracking-wider text-sub">
                                        Next
                                    </div>

                                    <div className="flex w-full items-center justify-end gap-2 font-semibold">
                                        {nextArticle.title}

                                        <span className="font-nerdfont">
                                            
                                        </span>
                                    </div>

                                    {nextArticle.group && (
                                        <div className="text-xs text-sub">
                                            {nextArticle.group}
                                        </div>
                                    )}
                                </Link>
                            ) : null}
                        </nav>
                    </div>
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label
                        htmlFor="my-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    />

                    <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                        <div className="menu w-full grow justify-between">

                            <div className="flex flex-col gap-4">
                                <Link to={supportBaseUrl}>
                                    <img
                                        alt="OpenProfile wordmark"
                                        className="my-2 mt-4 h-6 w-full"
                                        src={`${cdnBaseUrl}${window.config.metadata.assets.wordmark}`}
                                    />
                                </Link>

                                <label className="input w-full">
                                    <span className="mr-1 font-nerdfont text-base">
                                        
                                    </span>

                                    <input
                                        type="search"
                                        placeholder="Search articles..."
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                    />

                                    {query && (
                                        <button
                                            type="button"
                                            className="w-4 h-4 font-nerdfont leading-none text-base cursor-pointer bg-base-100"
                                            onClick={() => setQuery("")}
                                        >
                                            
                                        </button>
                                    )}
                                </label>

                                <div>
                                    {filteredGroups.map(
                                        (group) => {
                                            const isCurrentGroup =
                                                group.name ===
                                                currentGroup;

                                            const isCollapsed =
                                                normalizedQuery
                                                    ? false
                                                    : collapsedGroups[
                                                          group.name
                                                      ] ??
                                                      false;

                                            return (
                                                <li key={group.name}>
                                                    <details
                                                        className="no-arrow"
                                                        open={!isCollapsed}
                                                        onToggle={(event) =>
                                                            handleGroupToggle(
                                                                group.name,
                                                                event,
                                                            )
                                                        }
                                                    >
                                                        <summary 
                                                            className={`flex gap-4 ${
                                                                isCurrentGroup
                                                                    ? "text-accent"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="font-nerdfont flex h-8 w-4 items-center justify-center text-xl">
                                                                {getIcon(group.name)}
                                                            </span>

                                                            <span className="is-drawer-close:hidden text-sm">
                                                                {group.name}{" "}({group.articles.length})
                                                            </span>

                                                            <span className="details-arrow ml-auto font-nerdfont is-drawer-close:hidden">
                                                                
                                                            </span>
                                                        </summary>

                                                        <div className="details-content">
                                                            <div>
                                                                <ul>
                                                                    {group.articles.map(
                                                                        (item,) => (
                                                                            <ArticleNavItem
                                                                                key={item.slug}
                                                                                article={item}
                                                                                currentSlug={slug as string}
                                                                            />
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </details>
                                                </li>
                                            );
                                        },
                                    )}

                                    {filteredUngrouped.length > 0 && (
                                        <>
                                            {filteredUngrouped.map(
                                                (item,) => (
                                                    <ArticleNavItem
                                                        key={item.slug}
                                                        article={item}
                                                        currentSlug={slug as string}
                                                    />
                                                ),
                                            )}
                                        </>
                                    )}

                                    {normalizedQuery 
                                        && filteredUngrouped.length === 0 
                                        && filteredGroups.length === 0 && (
                                            <div className="px-3 py-8 text-center">
                                                <div className="text-sm font-medium">
                                                    No articles found
                                                </div>

                                                <div className="mt-1 text-xs text-sub">
                                                    Try another search term.
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
