import type { CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

export function getPublishedPosts(posts: PostEntry[]) {
  return [...posts]
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getFeaturedPosts(posts: PostEntry[], limit: number) {
  const published = getPublishedPosts(posts);
  const featured = published.filter((post) => post.data.featured);
  const queue = [...featured, ...published];
  const seen = new Set<string>();

  return queue
    .filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    })
    .slice(0, limit);
}

export function getTagStats(posts: PostEntry[]) {
  const counter = new Map<string, number>();

  for (const post of getPublishedPosts(posts)) {
    for (const tag of post.data.tags) {
      counter.set(tag, (counter.get(tag) || 0) + 1);
    }
  }

  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export function getRelatedPosts(post: PostEntry, posts: PostEntry[], limit: number) {
  const currentTags = new Set(post.data.tags);

  return getPublishedPosts(posts)
    .filter((entry) => entry.id !== post.id)
    .map((entry) => ({
      entry,
      score: entry.data.tags.reduce((sum, tag) => sum + (currentTags.has(tag) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.data.pubDate.valueOf() - a.entry.data.pubDate.valueOf())
    .slice(0, limit)
    .map((item) => item.entry);
}

export function estimateReadingMinutes(body: string) {
  const plainText = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/[#*_~\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const cjkCount = (plainText.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) || []).length;
  const latinWordCount = (
    plainText
      .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, ' ')
      .match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) || []
  ).length;

  return Math.max(1, Math.ceil((cjkCount + latinWordCount) / 300));
}
