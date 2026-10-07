export type ArticleMetadata = {
    title?: string;
    author?: string;
    date?: string;
    updated?: string;
};

export type ArticleItem = {
    slug: string;
    title: string;
    group?: string;
    author?: string;
    date?: string;
    updated?: string;
};

export type Article = ArticleItem & {
    content: string;
};

export type ArticleGroup = {
    name: string;
    articles: ArticleItem[];
};
