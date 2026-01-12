export enum NewsStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export type News = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  status: NewsStatus;
  isPinned: boolean;
  tags: string[];
  viewCount: number;
  pointSeo: number;
  focusKeyword?: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

export type NewsForm = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  status: NewsStatus;
  isPinned: boolean;
  pointSeo: number;
  focusKeyword?: string;
  tags: string[];
};
