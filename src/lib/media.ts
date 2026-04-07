import { animeEntries, gameEntries, type AnimeEntry, type GameEntry } from '@/data/media';

export interface AnimeInfo {
  name: string;
  label: string;
  url: string;
  year: string;
  note: string;
}

export interface GameInfo {
  name: string;
  label: string;
  url: string;
  year: string;
  note: string;
}

function createSearchUrl(base: string, keyword: string) {
  return `${base}${encodeURIComponent(keyword)}`;
}

function normalizeAnime(entry: AnimeEntry): AnimeInfo {
  return {
    name: entry.name,
    label: entry.label || entry.name,
    url: entry.url || createSearchUrl('https://bgm.tv/subject_search/', entry.name),
    year: entry.year || '',
    note: entry.note || '本地维护的清单项，不依赖构建期外部抓取。',
  };
}

function normalizeGame(entry: GameEntry): GameInfo {
  return {
    name: entry.name,
    label: entry.label || entry.name,
    url:
      entry.url ||
      createSearchUrl('https://store.steampowered.com/search/?term=', entry.label || entry.name),
    year: entry.year || '',
    note: entry.note || '本地维护的清单项，不依赖构建期外部抓取。',
  };
}

export function getAnimeCollection(): AnimeInfo[] {
  return animeEntries.map(normalizeAnime);
}

export function getGameCollection(): GameInfo[] {
  return gameEntries.map(normalizeGame);
}
