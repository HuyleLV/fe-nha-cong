export enum BlogStatus {
    Draft = 0,
    Published = 1,
    Archived = 2,
}

export type Blog = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string;
    status: BlogStatus;
    isPinned: boolean;
    tags: string[];
    viewCount: number;
    pointSeo: number;
    focusKeyword?: string;
    authorId: number;
    createdAt: string;
    updatedAt: string;
};

export type BlogForm = {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    coverImageUrl?: string;
    status: BlogStatus;
    isPinned: boolean;
    pointSeo: number;
    focusKeyword?: string;
    tags: string[];
};