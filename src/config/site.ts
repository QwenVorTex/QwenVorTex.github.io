export const siteConfig = {
  name: 'TorQuen Blog',
  shortName: 'TorQuen',
  title: 'TorQuen Blog',
  description: '一个关于设计、前端实现与数字审美的个人博客。',
  url: 'https://qwen-blog-2i19bt4j.edgeone.cool',
  locale: 'zh-CN',
  ogImage: '/og-default.svg',
  author: {
    name: 'TorQuen',
    role: '开发者 / 设计探索者',
    bio: '记录设计观察、前端实现和个人项目的过程。',
    email: '',
  },
  social: {
    github: 'https://github.com/QwenVorTex/',
    x: '',
    bilibili: 'https://space.bilibili.com/351913963',
  },
  navigation: {
    primary: [
      { label: '首页', href: '/' },
      { label: '文章', href: '/archive' },
      { label: '关于', href: '/about' },
    ],
    secondary: [
      { label: '追番', href: '/anime' },
      { label: '游戏', href: '/games' },
    ],
  },
  home: {
    eyebrow: '个人博客 / Design and Code Notes',
    title: '写设计，做前端，也记录正在形成的审美判断。',
    subtitle:
      '这里不只展示风格，也记录选择这种风格的理由：界面为什么这样做，交互为什么这样取舍，代码如何支撑它。',
    ctaLabel: '从文章开始',
    ctaHref: '/archive',
    secondaryLabel: '了解作者',
    secondaryHref: '/about',
  },
} as const;

export type SiteConfig = typeof siteConfig;
