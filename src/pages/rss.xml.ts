import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { siteConfig } from '@/config/site';
import { getPublishedPosts } from '@/lib/posts';

export async function GET(context: APIContext) {
  const posts = getPublishedPosts(await getCollection('posts'));

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
