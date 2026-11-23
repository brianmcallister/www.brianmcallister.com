// Builds the posts in writing/ into pages under public/writing/.
//
// Each post is a Markdown file whose name becomes its URL, so
// writing/my-post.md is served at /writing/my-post. It starts with a
// short header:
//
//   ---
//   title: My post
//   date: 2026-11-22
//   description: Optional, for search results and link previews.
//   draft: true
//   ---
//
// Drafts are built locally and in preview deployments, never in
// production. Vercel runs this before every deploy.

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sourceDir = join(root, 'writing');
const outputDir = join(root, 'public', 'writing');
const includeDrafts = process.env.VERCEL_ENV !== 'production';

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Front matter

const parseFrontMatter = (file, text) => {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    throw new Error(`${file}: missing the --- header with a title and date`);
  }

  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(\w+):\s*(.*)$/);

    if (field) {
      data[field[1]] = field[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
  }

  if (!data.title) {
    throw new Error(`${file}: the header needs a title`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date ?? '')) {
    throw new Error(`${file}: the header needs a date written as YYYY-MM-DD`);
  }

  return { data, body: text.slice(match[0].length) };
};

// Markdown
//
// A small converter for the parts of Markdown a post needs: headings,
// paragraphs, emphasis, links, images, inline and fenced code, lists,
// block quotes and rules. A block that starts with an HTML tag is passed
// through as is, for anything else.

// Straight quotes and apostrophes become curly ones. Code and URLs are
// set aside before this runs, so they keep their straight quotes.
const smartQuotes = (text) =>
  text
    .replace(/'(?=\d{2}s\b)/g, '’')
    .replace(/(^|[\s([{*_\u0000“-])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[\s([{*_\u0000‘-])"/g, '$1“')
    .replace(/"/g, '”');

const renderInline = (text) => {
  // Code spans, images and links are set aside first, so emphasis rules
  // never reach inside code or URLs. They go back in at the end.
  const kept = [];
  const keep = (html) => `\u0000${kept.push(html) - 1}\u0000`;

  const html = escapeHtml(
    smartQuotes(
      text
        .replace(/`([^`]+)`/g, (_, code) => keep(`<code>${escapeHtml(code)}</code>`))
        .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)/g, (_, alt, src, title) =>
          keep(
            `<img src="${escapeHtml(src)}" alt="${escapeHtml(smartQuotes(alt))}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" />`,
          ),
        )
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
          keep(`<a href="${escapeHtml(href)}">${renderInline(label)}</a>`),
        ),
    ),
  )
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/ {2,}\n/g, '<br />\n');

  return html.replace(/\u0000(\d+)\u0000/g, (_, index) => kept[index]);
};

// A paragraph that is only a bold note like **[Image: the first slide]**
// marks where an image will go. It shows as a 16:9 box with the note
// inside, until the note is replaced with the image.
const IMAGE_PLACEHOLDER = /^\*\*\[(Image:[\s\S]*)\]\*\*$/;

// A paragraph that is only a link to a YouTube video, like
// [Title](https://www.youtube.com/watch?v=ID), becomes the video. The page
// shows the video's still with a play button, and /video.js swaps in
// YouTube's player when it's pressed, so the player only loads when
// wanted and doesn't flash into place. Without JavaScript, the still is
// a link to the video on YouTube.
const YOUTUBE_LINK =
  /^\[([^\]]+)\]\(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})[^)\s]*\)$/;

const renderVideo = (title, id) => `<figure class="video">
  <a class="video__poster" href="https://www.youtube.com/watch?v=${id}" data-video-id="${id}" data-video-title="${escapeHtml(title)}">
    <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" alt="" width="1280" height="720" decoding="async" />
    <span class="video__play" aria-hidden="true"></span>
    <span class="visually-hidden">Play video: ${escapeHtml(title)}</span>
  </a>
</figure>`;

const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

const renderMarkdown = (markdown) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    const text = paragraph.join('\n');
    const placeholder = text.match(IMAGE_PLACEHOLDER);
    const video = text.match(YOUTUBE_LINK);

    if (placeholder) {
      html.push(`<figure class="placeholder"><span>${escapeHtml(smartQuotes(placeholder[1]))}</span></figure>`);
    } else if (video) {
      html.push(renderVideo(smartQuotes(video[1]), video[2]));
    } else {
      html.push(`<p>${renderInline(text)}</p>`);
    }
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code
    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      flushParagraph();
      const code = [];
      for (i++; i < lines.length && !/^```\s*$/.test(lines[i]); i++) {
        code.push(lines[i]);
      }
      const language = fence[1] ? ` class="language-${fence[1]}"` : '';
      html.push(`<pre><code${language}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    // Raw HTML block, up to the next blank line
    if (!paragraph.length && /^<[a-zA-Z!/]/.test(line)) {
      const block = [line];
      while (i + 1 < lines.length && lines[i + 1].trim()) {
        block.push(lines[++i]);
      }
      html.push(block.join('\n'));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushParagraph();
      html.push('<hr />');
      continue;
    }

    if (/^>/.test(line)) {
      flushParagraph();
      const quote = [];
      for (; i < lines.length && /^>/.test(lines[i]); i++) {
        quote.push(lines[i].replace(/^>\s?/, ''));
      }
      i--;
      html.push(`<blockquote>\n${renderMarkdown(quote.join('\n'))}\n</blockquote>`);
      continue;
    }

    const item = line.match(LIST_ITEM);
    if (item && !item[1]) {
      flushParagraph();
      const ordered = /\d/.test(item[2]);
      const items = [];
      for (; i < lines.length; i++) {
        const next = lines[i].match(LIST_ITEM);
        if (next && !next[1]) {
          items.push(next[3]);
        } else if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length) {
          // An indented line continues the item above.
          items[items.length - 1] += `\n${lines[i].trim()}`;
        } else {
          break;
        }
      }
      i--;
      const tag = ordered ? 'ol' : 'ul';
      const start = ordered && item[2] !== '1.' ? ` start="${parseInt(item[2], 10)}"` : '';
      html.push(`<${tag}${start}>\n${items.map((text) => `  <li>${renderInline(text)}</li>`).join('\n')}\n</${tag}>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return html.join('\n');
};

// Page

// The logo's rotated squircle without the initials, as the link home. It
// uses the full logo's frame, so it sits where the full logo would. Each
// side is one curve, traced from the full logo's own outline.
const squircle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 792" aria-hidden="true">
  <path d="M305 239.4C348.3 239.4 461.6 352.7 461.6 396C461.6 439.3 348.3 552.6 305 552.6C261.7 552.6 148.4 439.3 148.4 396C148.4 352.7 261.7 239.4 305 239.4Z" />
</svg>`;

const formatDate = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  });

const renderPage = ({ title, date, description }, body) => {
  const content = renderMarkdown(body);
  const videoScript = content.includes('class="video__poster"')
    ? '\n    <script src="/video.js" defer></script>'
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <meta name="author" content="Brian Wm. McAllister" />
    <meta name="description" content="${escapeHtml(smartQuotes(description || title))}" />
    <meta name="theme-color" content="#1d2122" />
    <title>${escapeHtml(smartQuotes(title))} • Brian Wm. McAllister</title>
    <link rel="icon" href="/favicon.ico" />
    <link rel="preload" href="/fonts/karla-latin-200-800.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/ibm-plex-sans-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/base.css" />
    <link rel="stylesheet" href="/writing.css" />${videoScript}
  </head>
  <body>
    <div class="page">
      <header>
        <a class="home-link" href="/" aria-label="Brian Wm. McAllister, home">
          ${squircle.replace(/\n/g, '\n          ')}
        </a>
      </header>

      <main class="post">
        <article>
          <h1 class="post__title">${escapeHtml(smartQuotes(title))}</h1>
          <p class="post__date"><time datetime="${date}">${formatDate(date)}</time></p>
          <div class="post__body">
${content}
          </div>
        </article>
      </main>
    </div>
  </body>
</html>
`;
};

// Build

const files = (await readdir(sourceDir).catch(() => [])).filter((file) => file.endsWith('.md')).sort();

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

let built = 0;

for (const file of files) {
  const slug = file.slice(0, -'.md'.length);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${file}: use lowercase letters, numbers and dashes in post file names`);
  }

  const { data, body } = parseFrontMatter(file, await readFile(join(sourceDir, file), 'utf8'));

  if (data.draft === 'true' && !includeDrafts) {
    console.log(`Skipped draft  /writing/${slug}`);
    continue;
  }

  await writeFile(join(outputDir, `${slug}.html`), renderPage(data, body));
  console.log(`Built          /writing/${slug}${data.draft === 'true' ? ' (draft)' : ''}`);
  built++;
}

console.log(`${built} post${built === 1 ? '' : 's'} built.`);
