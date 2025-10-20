import Link from 'next/link';
import { notFound } from 'next/navigation';

import { API_BASE_URL, resolveAssetUrl } from '@/lib/apiClient';

const FALLBACK_COVER = 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png';

const formatDate = (value) => {
  if (!value) {
    return 'Data não informada';
  }

  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    console.error('[Editoria] Erro ao formatar data', error);
    return 'Data não informada';
  }
};

const fetchEditoria = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/editorias/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Falha ao carregar editoria.');
    }

    return response.json();
  } catch (error) {
    console.error('[Editoria] Erro ao carregar dados', error);
    return null;
  }
};

const toSafeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const resolveBackgroundStyle = (editoria) => {
  const coverImage = resolveAssetUrl(editoria.coverImage) || FALLBACK_COVER;
  const focusX = editoria.coverImageFocusX ?? 50;
  const focusY = editoria.coverImageFocusY ?? 50;
  const scale = toSafeNumber(editoria.coverImageScale, 100);

  const normalizedScale = Math.min(Math.max(scale, 80), 140);

  return {
    backgroundImage: `url(${coverImage})`,
    backgroundPosition: `${focusX}% ${focusY}%`,
    backgroundSize: normalizedScale === 100 ? 'cover' : `${normalizedScale}%`,
    backgroundRepeat: 'no-repeat',
  };
};

const formatArticleSummary = (summary, content) => {
  if (summary && summary.trim().length > 0) {
    return summary.trim();
  }

  if (content && content.trim().length > 0) {
    return content.trim().slice(0, 240).concat(content.length > 240 ? '…' : '');
  }

  return 'Conteúdo em produção. Em breve publicaremos a narrativa completa desta editoria.';
};

const ArticleCard = ({ editoriaSlug, article }) => {
  const href = `/editorias/${editoriaSlug}/${article.slug}`;
  const coverImage = resolveAssetUrl(article.coverImage);
  const summary = formatArticleSummary(article.summary, article.content);
  const publishedAt = formatDate(article.publishedAt || article.createdAt);
  const likes = toSafeNumber(article.stats?.likes ?? article.stats?.views, 0);
  const ratingsAverageValue = toSafeNumber(article.stats?.ratingsAvg, 0);
  const ratingsCount = toSafeNumber(article.stats?.ratingsCount, 0);
  const commentsCount = toSafeNumber(article.stats?.commentsCount, 0);
  const formattedLikes = likes.toLocaleString('pt-BR');
  const formattedRatingsCount = ratingsCount.toLocaleString('pt-BR');
  const formattedCommentsCount = commentsCount.toLocaleString('pt-BR');

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-800/60 bg-gray-950/60 transition-colors hover:border-red-500/40">
      <div className="relative aspect-[16/9] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Imagem do artigo ${article.title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-950/20 text-red-200">
            <span className="text-xs uppercase tracking-[0.4em]">TRAMA</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-gray-500">
          <span>{article.format ? article.format.toUpperCase() : 'TEXTO'}</span>
          <time dateTime={article.publishedAt || article.createdAt}>{publishedAt}</time>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-semibold text-white transition-colors group-hover:text-red-300">
            {article.title}
          </h3>
          <p className="text-base leading-relaxed text-gray-300">{summary}</p>
        </div>

        <dl className="grid grid-cols-3 gap-4 text-xs uppercase tracking-[0.3em] text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-red-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 8.25 12 8.25 12s8.25-4.78 8.25-12z"
              />
            </svg>
            <div>
              <dt className="sr-only">Curtidas</dt>
              <dd>{formattedLikes}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.48 3.499a.75.75 0 011.04 0l2.146 2.065 2.942.434a.75.75 0 01.416 1.28l-2.13 2.076.503 2.92a.75.75 0 01-1.088.791L12 11.984l-2.808 1.481a.75.75 0 01-1.088-.79l.503-2.92-2.13-2.077a.75.75 0 01.416-1.28l2.942-.434 2.146-2.066z" />
            </svg>
            <div className="flex flex-col">
              <dt className="sr-only">Avaliações</dt>
              <dd>{ratingsAverageValue.toFixed(1)}</dd>
              <span className="text-[0.65rem] normal-case tracking-normal text-gray-500">{formattedRatingsCount} avaliações</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9 2.25c0 1.243 1.507 2.25 3.363 2.25H9.75l4.5 3v-3h.387c1.856 0 3.363-1.007 3.363-2.25V6.75c0-1.243-1.507-2.25-3.363-2.25H6.363C4.507 4.5 3 5.507 3 6.75v6.75z"
              />
            </svg>
            <div>
              <dt className="sr-only">Comentários</dt>
              <dd>{formattedCommentsCount}</dd>
            </div>
          </div>
        </dl>

        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={`${article.slug}-${tag}`}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-red-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-red-400 transition-colors hover:text-red-300"
          >
            <span>Ler reportagem</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

const EmptyState = ({ editoria }) => (
  <section className="rounded-3xl border border-gray-800/80 bg-gray-900/40 p-10 text-center text-gray-400">
    <h3 className="text-2xl font-serif text-white">Produções em andamento</h3>
    <p className="mt-3 text-lg text-gray-300">
      Ainda não há reportagens publicadas em <strong>{editoria.title}</strong>, mas a equipa já está a trabalhar para trazer novas histórias em breve.
    </p>
  </section>
);

export default async function EditoriaPage({ params }) {
  const { editoriaSlug } = params;
  const editoria = await fetchEditoria(editoriaSlug);

  if (!editoria) {
    notFound();
  }

  const heroStyle = resolveBackgroundStyle(editoria);
  const descriptionImage = resolveAssetUrl(editoria.descriptionImage);
  const articles = Array.isArray(editoria.articles) ? editoria.articles : [];
  const orderedArticles = articles
    .slice()
    .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));

  return (
    <main className="bg-black text-white">
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ ...heroStyle, filter: 'brightness(0.85)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-6 py-24">
          <span className="sr-only">{editoria.title}</span>
        </div>
      </section>

      {descriptionImage && (
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <figure className="relative overflow-hidden rounded-3xl border border-gray-800/70 bg-gray-950/60">
            <img
              src={descriptionImage}
              alt={editoria.description?.trim() || `Descrição visual da editoria ${editoria.title}`}
              className="h-full w-full object-cover"
            />

            {(editoria.description?.trim() || editoria.title) && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-8 py-6 text-lg font-medium text-gray-100">
                {editoria.description?.trim() || `Descrição visual da editoria ${editoria.title}`}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        {orderedArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {orderedArticles.map((article) => (
              <ArticleCard key={article._id || article.slug} editoriaSlug={editoria.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState editoria={editoria} />
        )}
      </section>
    </main>
  );
}

