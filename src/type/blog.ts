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
    tags: string[];
};