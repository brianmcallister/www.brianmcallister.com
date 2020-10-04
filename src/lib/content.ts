import { NowPlaying } from '../components/NowPlaying';

export interface ContentItem {
  title: string;
  href: string;
}

export interface ContentBlockWithItems {
  title: string;
  items: ContentItem[];
}

export interface ContentBlockWithComponent {
  title: string;
  component: React.FunctionComponent;
}

export type ContentBlock = ContentBlockWithItems | ContentBlockWithComponent;

export const isWithItems = (
  content: ContentBlock,
): content is ContentBlockWithItems => {
  return 'items' in content;
};

export const CONTENT: ContentBlock[] = [
  {
    title: 'Talks',
    items: [
      {
        href: 'https://finjs.io/new-york-2/',
        title: 'Streaming prices (and more!) with redux-websocket',
      },
      {
        href: 'https://youtu.be/oCY90j3xCKI',
        title: 'Creating, Maintaining and Using a Design System',
      },
      {
        href: 'https://youtu.be/5_gkDf4YDJ8',
        title: 'Creating Icons for Digital Platforms',
      },
    ],
  },
  {
    title: 'Open Source',
    items: [
      {
        href: 'https://github.com/brianmcallister/highlight-text',
        title: 'highlight-text',
      },

      {
        href: 'https://github.com/brianmcallister/react-highlight-text',
        title: 'react-highlight-text',
      },

      {
        href: 'https://github.com/brianmcallister/react-auto-scroll',
        title: 'react-auto-scroll',
      },

      {
        href: 'https://github.com/brianmcallister/api-poller-worker',
        title: 'api-poller-worker',
      },

      {
        href: 'https://github.com/brianmcallister/use-api-poller-worker',
        title: 'use-api-poller-worker',
      },
      {
        href: 'https://github.com/brianmcallister/sequential-promise',
        title: 'sequential-promise',
      },
      {
        href: 'https://github.com/lab49/react-order-book',
        title: '@lab49/react-order-book',
      },
      {
        href: 'https://github.com/lab49/react-value-flash',
        title: '@lab49/react-value-flash',
      },
    ],
  },
  {
    title: 'Online',
    items: [
      {
        href: 'https://github.com/brianmcallister',
        title: 'GitHub',
      },
      {
        href: 'https://www.npmjs.com/~brianmcallister',
        title: 'npm',
      },
      {
        href: 'https://www.linkedin.com/in/brian-wm-mcallister/',
        title: 'LinkedIn',
      },
    ],
  },
  {
    title: 'Currently',
    items: [
      {
        href: 'https://www.lab49.com/',
        title: 'Engineering Practice Lead at Lab49',
      },
    ],
  },
  {
    title: 'Now Playing',
    component: NowPlaying,
  },
];
