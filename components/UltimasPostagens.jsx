import Link from 'next/link';

import { resolveAssetUrl } from '../lib/apiClient';

const formatDate = (dateString) => {
  if (!dateString) return 'Data indisponível';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (_error) {
    return 'Data indisponível';
  }
};

const PostCard = ({ post }) => {
  const coverImage = resolveAssetUrl(post.coverImage);
  const editoriaSlug = post.editoriaId?.slug || post.editoriaId?.slugify;
  const articleSlug = post.slug;
  const href = editoriaSlug && articleSlug
    ? `/editorias/${editoriaSlug}/${articleSlug}`
    : '#';

  return (
    <article className="bg-gray-900/50 rounded-3xl overflow-hidden shadow-lg shadow-black/40">
      <div className="aspect-video overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={`Capa do artigo ${post.title}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600 text-sm uppercase tracking-widest">
            Sem imagem de capa
          </div>
        )}
      </div>
      <div className="p-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-red-400">{post.editoriaId?.title || 'Editorial'}</p>
        <h3 className="text-2xl font-serif font-bold leading-tight">
          {post.title}
        </h3>
        {post.summary && (
          <p className="text-sm text-gray-300 max-h-16 overflow-hidden">{post.summary}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          {post.stats?.views !== undefined && (
            <span>{post.stats.views} visualizações</span>
          )}
        </div>
        <div className="pt-3">
          <Link
            href={href}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            <span>Continuar a leitura</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default function UltimasPostagens({ posts = [] }) {
  if (!posts.length) {
    return (
      <section className="py-20 md:py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-6">Últimas Postagens</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ainda não existem artigos publicados. Assim que novas histórias forem lançadas, elas aparecerão aqui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif">Últimas Postagens</h2>
            <p className="text-gray-400 max-w-xl mt-2">
              Explore as histórias mais recentes publicadas pela equipa do Trama.
            </p>
          </div>
          <Link
            href="/editorias"
            className="inline-flex items-center space-x-2 text-sm uppercase tracking-widest text-red-400 hover:text-red-300"
          >
            <span>Ver todas as editorias</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
