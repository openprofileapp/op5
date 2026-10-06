import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { cdnBaseUrl, mainBaseUrl } from "../../_common/scripts/domains.js";
import NotFound from "../../_common/pages/NotFound.js";
import Metadata from "../../_common/components/Metadata.js";
import MarkdownRenderer from "../../_common/components/markdown/Renderer.js";
import { formatShortRelative } from "../../_common/scripts/time.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const articles = import.meta.glob("./articles/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>

type ArticleItem = {
    slug: string
    path: string
    title: string
    group?: string
}

type ArticleGroup = {
    name: string
    articles: ArticleItem[]
}

type ArticleMetadata = {
    title?: string
    author?: string
    date?: string
    updated?: string
}

function getGroup(slug: string) {
    const article = articleItems.find(
        (item) => item.slug === slug
    )

    return article?.group
}

function getIcon(name: string) {
    switch (name.toLowerCase()) {
        case "change logs":
            return "";
        case "legal":
            return "";

        default:
            return "";
    }
}

function getMetadata(content: string): ArticleMetadata {
    const match = content.match(
        /^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
    )

    if (!match) {
        return {}
    }

    const metadata: ArticleMetadata = {}

    for (const line of match[1].split(/\r?\n/)) {
        const match = line.match(/^(\w+)\s*:\s*(.+)$/)

        if (!match) {
            continue
        }

        const [, key, value] = match

        metadata[key as keyof ArticleMetadata] = value
            .trim()
            .replace(/^["']|["']$/g, "")
    }

    return metadata
}

function formatTitle(value: string) {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase()
        )
}

const articleItems: ArticleItem[] = Object.keys(articles)
    .map((path) => {
        const relativePath = path
            .replace("./articles/", "")
            .replace(/\.md$/, "")

        const parts = relativePath.split("/")

        const title = parts.pop() || ""
        const group = parts.length > 0
            ? parts.join("/")
            : undefined

        return {
            slug: relativePath,
            path,
            title: formatTitle(title),
            group: group ? formatTitle(group) : undefined,
        }
    })
    .sort((a, b) => {
        if (a.group !== b.group) {
            if (!a.group) return -1
            if (!b.group) return 1

            console.log(a.group)

            if (a.group.toLowerCase() === "change logs") return 1
            if (b.group.toLowerCase() === "change logs") return -1

            return a.group.localeCompare(b.group)
        }

        return a.title.localeCompare(b.title)
    })

function getGroups(): {
    ungrouped: ArticleItem[]
    grouped: ArticleGroup[]
} {
    const grouped = new Map<string, ArticleItem[]>()
    const ungrouped: ArticleItem[] = []

    for (const article of articleItems) {
        if (!article.group) {
            ungrouped.push(article)
            continue
        }

        if (!grouped.has(article.group)) {
            grouped.set(article.group, [])
        }

        grouped.get(article.group)!.push(article)
    }

    return {
        ungrouped,
        grouped: Array.from(grouped.entries()).map(
            ([name, articles]) => ({
                name,
                articles,
            })
        ),
    }
}

function ArticleNavItem({
    article,
    currentSlug,
}: {
    article: ArticleItem
    currentSlug: string
}) {
    const isActive = article.slug === currentSlug

    return (
        <li>
            <Link 
                className="flex items-center gap-4"
                to={`/en-us/article/${article.slug}`}
            >
                <span className={`${isActive ? "text-accent" : ""} flex h-8 items-center justify-center is-drawer-close:hidden text-sm`}>
                    {article.title}
                </span>
            </Link>
        </li>
    )
}

export default function Article() {
    const { "*": slug } = useParams<{ "*": string }>()
    const { t, ready: isTranslationReady } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [query, setQuery] = useState("");

    const groups = useMemo(() => getGroups(), [])

    const currentArticle = articleItems.find(
        (article) => article.slug === slug
    )

    const currentGroup = currentArticle?.group

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
        () => ({
            "Change Logs": true,
        }),
    )

    useEffect(() => { 
        window.scrollTo({ top: 0, behavior: "instant", }) 
    }, [slug])

    if (!slug) {
        return <NotFound />
    }

    const articlePath = `./articles/${slug}.md`;

    const rawContent = articles[articlePath];

    if (!rawContent) {
        return <NotFound />
    }

    const metadata = getMetadata(rawContent);

    const content = rawContent.replace(
        /^\uFEFF?\s*---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/,
        "",
    )

    const currentIndex = articleItems.findIndex(
        (article) => article.slug === slug
    )

    const previousArticle =
        currentIndex > 0
            ? articleItems[currentIndex - 1]
            : undefined

    const nextArticle =
        currentIndex >= 0 &&
        currentIndex < articleItems.length - 1
            ? articleItems[currentIndex + 1]
            : undefined

    const normalizedQuery = query.trim().toLowerCase()

    const filteredUngrouped = groups.ungrouped.filter(
        (article) =>
            !normalizedQuery ||
            article.title.toLowerCase().includes(normalizedQuery)
    )

    const filteredGroups = groups.grouped
        .map((group) => ({
            ...group,
            articles: group.articles.filter(
                (article) =>
                    !normalizedQuery ||
                    article.title
                        .toLowerCase()
                        .includes(normalizedQuery)
            ),
        }))
        .filter((group) => group.articles.length > 0)

    function handleGroupToggle(
        group: string,
        event: React.SyntheticEvent<HTMLDetailsElement>,
    ) {
        const details = event.nativeEvent.target as HTMLDetailsElement

        setCollapsedGroups((current) => ({
            ...current,
            [group]: !details.open,
        }))
    }

    if (!isTranslationReady) return null;
    
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
                    onChange={(e) => setDrawerOpen(e.target.checked)}
                    className="drawer-toggle" 
                />
                <div className="drawer-content border-l border-base-300">
                    <nav className="navbar sticky top-0 w-full border-b border-base-300 bg-base-100">
                        <div className="flex items-center">
                            <label
                                htmlFor="my-drawer"
                                aria-label="open sidebar"
                                className="ml-2 block btn btn-square btn-ghost hover:border-base-100 hover:bg-base-100 md:hidden"
                            >
                                <span className="flex h-8 w-4 items-center justify-center leading-none">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </label>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 font-semibold">
                            {metadata.title}
                        </div>

                        <div className="ml-auto flex items-center gap-5 text-sm mr-2 md:mr-4">
                            <Link to={mainBaseUrl}>
                                <span className="flex h-8 w-4 items-center justify-center leading-none">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </Link>
                        </div>
                    </nav>

                    <div className="mx-4 my-4 md:mx-16 md:my-8">
                        <article className="overflow-hidden rounded-xl border border-base-300 bg-base-100 p-12">
                            {Object.keys(metadata).length > 0 && (
                                <>
                                    <header className="mb-10">
                                        <h1 className="text-4xl font-bold">
                                            {metadata.title}
                                        </h1>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
                                            {metadata.author && (
                                                <span className="flex gap-2">
                                                    By <MarkdownRenderer content={metadata.author} />
                                                </span>
                                            )}

                                            {metadata.date && (
                                                <span className="flex gap-2">
                                                    <span className="font-nerdfont">
                                                        
                                                    </span>

                                                    Published {formatShortRelative(metadata.date)}
                                                </span>
                                            )}

                                            {metadata.updated && metadata.date !== metadata.updated && (
                                                <>
                                                    <span className="font-nerdfont text-xs">
                                                        
                                                    </span>
                                                    
                                                    <span className="flex gap-2">
                                                        <span className="font-nerdfont">
                                                            
                                                        </span>

                                                        Updated {formatShortRelative(metadata.updated)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </header>

                                    <hr />
                                </>
                            )}

                            <MarkdownRenderer content={content} />
                        </article>

                        <nav
                            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                            aria-label="Article navigation"
                        >
                            {previousArticle ? (
                                <Link
                                    to={`/en-us/article/${previousArticle.slug}`}
                                    className="flex flex-col gap-3 group rounded-xl border border-base-300 bg-base-100 p-4 text-left"
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
                                    className="flex flex-col gap-3 group rounded-xl border border-base-300 bg-base-100 p-4 text-right"
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
                    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                        <div className="menu w-full grow justify-between">
                            <div className="flex flex-col gap-4">
                                <img
                                    alt="OpenProfile wordmark"
                                    className="h-6 w-full my-2 mt-4"
                                    src={`${cdnBaseUrl}${window.config.metadata.assets.wordmark}`}
                                />
                                
                                <label className="input w-full">
                                    <span className="font-nerdfont text-base mr-1"></span>
                                    <input 
                                        type="search" 
                                        placeholder="Search articles..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </label>

                                <div>
                                    {filteredGroups.map((group) => {
                                        const isCurrentGroup =
                                            group.name === currentGroup

                                        const isCollapsed =
                                            normalizedQuery
                                                ? false
                                                : collapsedGroups[
                                                    group.name
                                                ] ?? false

                                        return (
                                            <li key={group.name}>
                                                <details
                                                    className="no-arrow"
                                                    open={!isCollapsed}
                                                    onToggle={(event) => handleGroupToggle(group.name, event)}
                                                >
                                                    <summary className={`flex gap-4 ${isCurrentGroup ? "text-accent" : ""}`}>
                                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                            {getIcon(group.name)}
                                                        </span>
                                                        <span className="is-drawer-close:hidden text-sm">
                                                            {group.name} ({group.articles.length})
                                                        </span>
                                                        <span className="ml-auto font-nerdfont details-arrow is-drawer-close:hidden">
                                                            
                                                        </span>
                                                    </summary>
                                                    
                                                    <div className="details-content">
                                                        <div>
                                                            <ul>
                                                                {group.articles.map(
                                                                    (article) => (
                                                                        <ArticleNavItem
                                                                            key={article.slug}
                                                                            article={article}
                                                                            currentSlug={slug}
                                                                        />
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </details>
                                            </li>
                                        )
                                    })}

                                    {filteredUngrouped.length > 0 && (
                                        <>
                                            {filteredUngrouped.map(
                                                (article) => (
                                                    <ArticleNavItem
                                                        key={article.slug}
                                                        article={article}
                                                        currentSlug={slug}
                                                    />
                                                )
                                            )}
                                        </>
                                    )}

                                    {normalizedQuery &&
                                        filteredUngrouped.length === 0 &&
                                        filteredGroups.length === 0 && (
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

                            <ul>
                                <hr />

                                <li>
                                    <button 
                                        className="flex items-center gap-4"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Settings
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
