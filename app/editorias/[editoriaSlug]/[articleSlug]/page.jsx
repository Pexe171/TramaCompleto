import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { API_BASE_URL, resolveAssetUrl } from '@/lib/apiClient';

const YOUTUBE_URL_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[^\s"'<>)]*)?/i;

const BASE_HIGHLIGHT_CLASS = 'inline-flex items-center px-2 py-0.5 rounded-md font-semibold tracking-wide border';

const NAMED_HIGHLIGHTS = {
  vermelho: 'bg-red-500/20 text-red-100 border-red-400/40',
  vinho: 'bg-rose-500/20 text-rose-100 border-rose-400/40',
  azul: 'bg-sky-500/20 text-sky-100 border-sky-400/40',
  ciano: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/40',
  verde: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40',
  amarelo: 'bg-amber-400/20 text-amber-900 border-amber-300/40',
  dourado: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  laranja: 'bg-orange-500/20 text-orange-100 border-orange-400/40',
  roxo: 'bg-violet-500/20 text-violet-100 border-violet-400/40',
  lilas: 'bg-purple-500/20 text-purple-100 border-purple-400/40',
  preto: 'bg-gray-950 text-gray-50 border-gray-500/40',
  branco: 'bg-gray-100 text-gray-900 border-gray-300/70',
};

const HIGHLIGHT_PATTERN = /\{\{([#\wÀ-ÿ\s]+?)\|([\s\S]+?)\}\}/g;

const formatDate = (value) => {
  if (!value) return 'Data não informada';
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.error('[Artigo] Erro ao formatar data', error);
    return 'Data não informada';
  }
};

const isHexColor = (value) => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);

const hexToRgb = (hex) => {
  let value = hex.replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const int = parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return { r, g, b };
};

const getReadableTextColor = ({ r, g, b }) => {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#0f172a' : '#f9fafb';
};

const resolveHighlightStyles = (colorRaw) => {
  if (!colorRaw) {
    return { className: NAMED_HIGHLIGHTS.vermelho, style: undefined };
  }

  const color = colorRaw.trim().toLowerCase();
  if (NAMED_HIGHLIGHTS[color]) {
    return { className: NAMED_HIGHLIGHTS[color], style: undefined };
  }

  if (isHexColor(color)) {
    const rgb = hexToRgb(color);
    const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;
    const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`;
    const textColor = getReadableTextColor(rgb);
    return {
      className: 'bg-transparent',
      style: {
        backgroundColor,
        borderColor,
        color: textColor,
      },
    };
  }

  return { className: NAMED_HIGHLIGHTS.vermelho, style: undefined };
};

const renderTextWithHighlights = (text, keyPrefix) => {
  if (!text) {
    return [];
  }

  const regex = new RegExp(HIGHLIGHT_PATTERN);
  const nodes = [];
  let cursor = 0;
  let match;
  let localIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(
        <span key={`${keyPrefix}-text-${localIndex++}`}>{text.slice(cursor, match.index)}</span>
      );
    }

    const color = match[1]?.trim();
    const value = match[2]?.trim();
    if (value) {
      const { className, style } = resolveHighlightStyles(color);
      nodes.push(
        <span
          key={`${keyPrefix}-highlight-${localIndex++}`}
          className={`${BASE_HIGHLIGHT_CLASS} ${className}`.trim()}
          style={style}
        >
          {value}
        </span>
      );
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(<span key={`${keyPrefix}-text-${localIndex++}`}>{text.slice(cursor)}</span>);
  }

  return nodes.length ? nodes : [<span key={`${keyPrefix}-text-0`}>{text}</span>];
};

const renderParagraphBlock = (block, index) => {
  const lines = block.split('\n');

  return (
    <p key={`paragraph-${index}`} className="text-lg leading-relaxed text-gray-200 space-y-3">
      {lines.map((line, lineIndex) => {
        const lineNodes = renderTextWithHighlights(line, `block-${index}-line-${lineIndex}`);
        return (
          <React.Fragment key={`paragraph-line-${index}-${lineIndex}`}>
            {lineNodes}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </p>
  );
};

const renderVideoBlock = (videoId, key) => (
  <div key={`video-${key}`} className="my-10">
    <div className="relative w-full overflow-hidden rounded-3xl border border-red-500/40 bg-black shadow-lg shadow-red-900/30 pt-[56.25%]">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Vídeo incorporado do YouTube"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      ></iframe>
    </div>
  </div>
);

const extractYoutubeData = (rawBlock) => {
  if (!rawBlock) {
    return null;
  }

  const createVideoData = (match, urlMatch) => {
    if (!match || !urlMatch) {
      return null;
    }

    const start = match.index ?? 0;
    const end = start + match[0].length;
    const before = rawBlock.slice(0, start).trim();
    const after = rawBlock.slice(end).trim();

    return {
      videoId: urlMatch[1],
      before,
      after,
    };
  };

  // 1) iframe embed pasted from another blog/editor
  const iframeRegex = /<iframe[\s\S]*?src=["']([^"']+)["'][\s\S]*?<\/iframe>/i;
  const iframeMatch = rawBlock.match(iframeRegex);
  if (iframeMatch) {
    const urlMatch = iframeMatch[1].match(YOUTUBE_URL_REGEX);
    const videoData = createVideoData(iframeMatch, urlMatch);
    if (videoData) {
      return videoData;
    }
  }

  // 2) Markdown style link: [texto](https://youtu.be/...)
  const markdownRegex = /\[[^\]]*\]\((https?:\/\/[^)]+)\)/i;
  const markdownMatch = rawBlock.match(markdownRegex);
  if (markdownMatch) {
    const urlMatch = markdownMatch[1].match(YOUTUBE_URL_REGEX);
    const videoData = createVideoData(markdownMatch, urlMatch);
    if (videoData) {
      return videoData;
    }
  }

  // 3) Link copiado como <a href="https://youtu.be/...">texto</a>
  const anchorRegex = /<a[\s\S]*?href=["']([^"']+)["'][\s\S]*?<\/a>/i;
  const anchorMatch = rawBlock.match(anchorRegex);
  if (anchorMatch) {
    const urlMatch = anchorMatch[1].match(YOUTUBE_URL_REGEX);
    const videoData = createVideoData(anchorMatch, urlMatch);
    if (videoData) {
      return videoData;
    }
  }

  // 4) URL isolada em uma linha
  const urlMatch = rawBlock.match(YOUTUBE_URL_REGEX);
  if (urlMatch) {
    const videoData = createVideoData(urlMatch, urlMatch);
    if (videoData) {
      return videoData;
    }
  }

  return null;
};

const renderContentBlocks = (content) => {
  if (!content) {
    return [
      <p key="empty" className="text-gray-400">
        Este artigo ainda não possui conteúdo redigido.
      </p>,
    ];
  }

  const blocks = content.split(/\r?\n{2,}/).filter((block) => block.trim().length > 0);
  const elements = [];

  blocks.forEach((block, index) => {
    const videoData = extractYoutubeData(block);

    if (videoData) {
      if (videoData.before) {
        elements.push(renderParagraphBlock(videoData.before, `${index}-before`));
      }

      elements.push(renderVideoBlock(videoData.videoId, index));

      if (videoData.after) {
        elements.push(renderParagraphBlock(videoData.after, `${index}-after`));
      }
      return;
    }

    elements.push(renderParagraphBlock(block, index));
  });

  return elements;
};

const fetchArticle = async (editoriaSlug, articleSlug) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/articles/${editoriaSlug}/${articleSlug}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Falha ao carregar artigo.');
    }

    return response.json();
  } catch (error) {
    console.error('[Artigo] Erro ao carregar dados', error);
    return null;
  }
};

export default async function ArticlePage({ params }) {
  const { editoriaSlug, articleSlug } = params;
  const article = await fetchArticle(editoriaSlug, articleSlug);

  if (!article) {
    notFound();
  }

  const coverImage = resolveAssetUrl(article.coverImage);
  const authorName = article.authorId?.displayName || 'Redacção Trama';
  const editoriaTitle = article.editoriaId?.title || 'Artigos';
  const publishedDate = formatDate(article.publishedAt || article.createdAt);

  return (
    <main className="min-h-screen bg-black text-white">
      <article className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-gray-500">
          <Link
            href={`/editorias/${editoriaSlug}`}
            className="inline-flex items-center gap-2 text-red-400 transition-colors hover:text-red-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Voltar para {editoriaTitle}</span>
          </Link>
          <span>{publishedDate}</span>
        </div>

        <header className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-red-400">{editoriaTitle}</p>
          <h1 className="text-4xl font-serif font-bold leading-tight sm:text-5xl">{article.title}</h1>
          {article.summary && (
            <p className="text-lg text-gray-300 sm:text-xl">{article.summary}</p>
          )}
          <div className="text-sm text-gray-500">
            Escrito por <span className="text-gray-200">{authorName}</span>
          </div>
        </header>

        {coverImage && (
          <div className="my-10 overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
            <img
              src={coverImage}
              alt={`Imagem de destaque do artigo ${article.title}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <section className="prose prose-invert max-w-none space-y-6">
          {renderContentBlocks(article.content)}
        </section>
      </article>
    </main>
  );
}
