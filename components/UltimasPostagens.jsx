import Link from 'next/link';

import { resolveAssetUrl } from '@/lib/apiClient';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/tramarp?igsh=NzFiamhxbG53MGl3&utm_source=qr',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M12 2.162c3.204 0 3.584.012 4.85.07 1.17.055 1.97.24 2.43.401a4.915 4.915 0 0 1 1.78 1.155 4.915 4.915 0 0 1 1.155 1.78c.16.46.346 1.26.401 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.401 2.43a4.915 4.915 0 0 1-1.155 1.78 4.915 4.915 0 0 1-1.78 1.155c-.46.16-1.26.346-2.43.401-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.43-.401a4.915 4.915 0 0 1-1.78-1.155 4.915 4.915 0 0 1-1.155-1.78c-.16-.46-.346-1.26-.401-2.43C2.174 15.584 2.162 15.204 2.162 12s.012-3.584.07-4.85c.055-1.17.24-1.97.401-2.43a4.915 4.915 0 0 1 1.155-1.78 4.915 4.915 0 0 1 1.78-1.155c.46-.16 1.26-.346 2.43-.401C8.416 2.174 8.796 2.162 12 2.162zm0-2.162C8.741 0 8.332.014 7.052.072 5.772.129 4.84.322 4.05.61a7.078 7.078 0 0 0-2.56 1.66A7.078 7.078 0 0 0-.07 4.83c-.287.79-.48 1.722-.538 3.002C-.666 9.112-.68 9.521-.68 12c0 2.479.014 2.888.072 4.168.057 1.28.25 2.212.538 3.002a7.078 7.078 0 0 0 1.66 2.56 7.078 7.078 0 0 0 2.56 1.66c.79.287 1.722.48 3.002.538C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.28-.057 2.212-.25 3.002-.538a7.078 7.078 0 0 0 2.56-1.66 7.078 7.078 0 0 0 1.66-2.56c.287-.79.48-1.722.538-3.002.057-1.28.072-1.689.072-4.168 0-2.479-.014-2.888-.072-4.168-.057-1.28-.25-2.212-.538-3.002a7.078 7.078 0 0 0-1.66-2.56 7.078 7.078 0 0 0-2.56-1.66c-.79-.287-1.722-.48-3.002-.538C15.668.014 15.259 0 12 0z" />
        <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
        <circle cx="18.406" cy="5.594" r="1.44" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@TramaRP',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M21.543 6.498a2.73 2.73 0 0 0-1.92-1.925C17.924 4.2 12 4.2 12 4.2s-5.924 0-7.623.373a2.73 2.73 0 0 0-1.92 1.925C2.1 8.205 2.1 12 2.1 12s0 3.795.357 5.502a2.73 2.73 0 0 0 1.92 1.925c1.699.373 7.623.373 7.623.373s5.924 0 7.623-.373a2.73 2.73 0 0 0 1.92-1.925C21.9 15.795 21.9 12 21.9 12s0-3.795-.357-5.502zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@tramarp?_t=ZM-90WzN02ffDg&_r=1',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M21.945 8.178c-2.732-.223-4.757-1.898-4.988-4.701h-.006V3.33c0-.36-.29-.652-.65-.652h-3.251c-.36 0-.652.292-.652.652v11.428c0 1.51-1.23 2.736-2.748 2.736-1.517 0-2.748-1.226-2.748-2.736s1.231-2.736 2.748-2.736c.36 0 .652-.293.652-.653V8.119c0-.36-.292-.653-.652-.653-3.192 0-5.787 2.584-5.787 5.765 0 3.181 2.595 5.766 5.787 5.766 3.192 0 5.787-2.585 5.787-5.766V9.899c1.384.88 3.072 1.4 4.857 1.4.36 0 .652-.292.652-.652V8.831c0-.344-.265-.627-.598-.653z" />
      </svg>
    ),
  },
];

const SocialLinks = () => (
  <div className="mt-12 max-w-3xl mx-auto text-center md:text-left">
    <h3 className="text-xl font-serif mb-4">Siga o Trama nas redes</h3>
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
          aria-label={`Abrir ${social.name} do Trama em uma nova aba`}
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400">
            {social.icon}
          </span>
          <span className="text-base font-medium">{social.name}</span>
        </a>
      ))}
    </div>
  </div>
);

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
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Últimas Postagens</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ainda não existem artigos publicados. Assim que novas histórias forem lançadas, elas aparecerão aqui.
            </p>
          </div>
          <div className="flex justify-center">
            <SocialLinks />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-24 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-serif">Últimas Postagens</h2>
          <p className="text-gray-400 max-w-xl mx-auto md:mx-0 mt-2">
            Explore as histórias mais recentes publicadas pela equipa do Trama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
        <SocialLinks />
      </div>
    </section>
  );
}
