import type { MetadataRoute } from 'next';
import { getAllPosts } from '../lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://domlog.vercel.app';
  const posts = getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date).toISOString().slice(0, 10),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().slice(0, 10),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString().slice(0, 10),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...postUrls,
  ];
}
