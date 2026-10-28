export interface PostMeta {
  title: string;
  slug: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: string;
  draft?: boolean;
}

export interface Post extends PostMeta {
  content: string;
  htmlContent: string;
}
