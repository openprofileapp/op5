export interface ArticleMetadata {
    title?: string;
    author?: string;
    date?: string;
    updated?: string;
    keywords?: string[];
}

export interface ArticleItem {
    slug: string;
    title: string;
    group?: string;
    author?: string;
    date?: string;
    updated?: string;
    keywords?: string[];
}

export type Article = ArticleItem & {
    content: string;
};

export type ArticleGroup = {
    name: string;
    articles: ArticleItem[];
};
