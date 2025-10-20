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

const resolveBackgroundStyle = (editoria) => {
  const coverImage = resolveAssetUrl(editoria.coverImage) || FALLBACK_COVER;
  const focusX = editoria.coverImageFocusX ?? 50;
  const focusY = editoria.coverImageFocusY ?? 50;
  const scale = editoria.coverImageScale ?? 100;

  return {
    backgroundImage: `url(${coverImage})`,
    backgroundPosition: `${focusX}% ${focusY}%`,
    backgroundSize: `${scale}%`,
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
  const latestUpdate = articles[0]?.publishedAt || articles[0]?.createdAt || editoria.updatedAt || editoria.createdAt;
  const articleCount = articles.length;

  return (
    <main className="bg-black text-white">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 opacity-25" style={heroStyle} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col justify-center gap-8 px-6 py-24 text-left">
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.4em] text-red-300">
            <span>Editorial</span>
            <span className="h-px flex-1 bg-red-500/40" aria-hidden="true" />
            <span>TRAMA</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-serif font-bold leading-tight sm:text-6xl">{editoria.title}</h1>
            <p className="max-w-2xl text-lg text-gray-200 sm:text-xl">
              {editoria.description?.trim() || 'Hub de narrativas visuais e sonoras que exploram comunicação, cultura e arte com o olhar da equipa TRAMA.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm uppercase tracking-[0.3em] text-gray-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-200">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
              Actualizado em {formatDate(latestUpdate)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zM9 9.75a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0v-9A.75.75 0 019 9.75zM15 3.75a.75.75 0 01.75.75v15a.75.75 0 01-1.5 0v-15A.75.75 0 0115 3.75z" />
              </svg>
              {articleCount === 1 ? '1 reportagem publicada' : `${articleCount} reportagens publicadas`}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-semibold">Painel editorial</h2>
            <Link
              href="/editorias"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500 transition-colors hover:text-red-300"
            >
              Ver todas
            </Link>
          </div>
          <p className="text-lg text-gray-300">
            Cada narrativa aqui publicada reforça o propósito da TRAMA: conectar cinema, comunicação e cultura com profundidade.
            Explore o acervo e acompanhe os bastidores das produções que fazem desta editoria um hub de histórias.
          </p>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article._id || article.slug} editoriaSlug={editoria.slug} article={article} />
              ))}
            </div>
          ) : (
            <EmptyState editoria={editoria} />
          )}
        </div>

        <aside className="space-y-6 rounded-3xl border border-gray-800/70 bg-gray-900/40 p-8">
          <div className="space-y-3">
            <h3 className="text-xl font-serif font-semibold text-white">Identidade visual</h3>
            <p className="text-sm text-gray-400">
              Utilize este painel como referência rápida ao montar novas publicações. A imagem abaixo reforça o conceito visual desta editoria.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-950/60">
            {descriptionImage ? (
              <img
                src={descriptionImage}
                alt={`Identidade da editoria ${editoria.title}`}
                className="h-auto w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-900 text-gray-500">
                <span className="text-xs uppercase tracking-[0.4em]">Sem imagem complementar</span>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-400">
            <p>
              <strong className="block text-xs uppercase tracking-[0.35em] text-gray-500">Prioridade editorial</strong>
              {editoria.priority ?? 0}
            </p>
            <p>
              <strong className="block text-xs uppercase tracking-[0.35em] text-gray-500">Criada em</strong>
              {formatDate(editoria.createdAt)}
            </p>
            <p>
              <strong className="block text-xs uppercase tracking-[0.35em] text-gray-500">Última revisão</strong>
              {formatDate(editoria.updatedAt || editoria.createdAt)}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

