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
        className="h-7 w-7"
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
        className="h-7 w-7"
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
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M21.945 8.178c-2.732-.223-4.757-1.898-4.988-4.701h-.006V3.33c0-.36-.29-.652-.65-.652h-3.251c-.36 0-.652.292-.652.652v11.428c0 1.51-1.23 2.736-2.748 2.736-1.517 0-2.748-1.226-2.748-2.736s1.231-2.736 2.748-2.736c.36 0 .652-.293.652-.653V8.119c0-.36-.292-.653-.652-.653-3.192 0-5.787 2.584-5.787 5.765 0 3.181 2.595 5.766 5.787 5.766 3.192 0 5.787-2.585 5.787-5.766V9.899c1.384.88 3.072 1.4 4.857 1.4.36 0 .652-.292.652-.652V8.831c0-.344-.265-.627-.598-.653z" />
      </svg>
    ),
  },
];

const CameraIcon = ({ className }) => (
  <svg
    viewBox="0 0 140 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M18 34c0-8.284 6.716-15 15-15h24l12-12h26l7.5 12H120c8.284 0 15 6.716 15 15v31c0 8.284-6.716 15-15 15H33c-8.284 0-15-6.716-15-15V34Z"
      fill="#c4121a"
    />
    <rect x="20" y="36" width="112" height="40" rx="18" fill="#9b0f16" />
    <circle cx="54" cy="54" r="17" fill="#fff" />
    <circle cx="86" cy="54" r="17" fill="#fff" />
    <circle cx="54" cy="54" r="7" fill="#191414" />
    <circle cx="86" cy="54" r="7" fill="#191414" />
    <path
      d="M36 46c2.4-6.8 9.2-12 18-12h34c8.8 0 15.6 5.2 18 12"
      stroke="#f5d7da"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path d="M38 24h14" stroke="#f5d7da" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const SocialLinks = () => (
  <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-10">
    {SOCIAL_LINKS.map((social) => (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-32 flex-col items-center gap-3 text-center text-[0.75rem] font-semibold uppercase tracking-[0.28em] text-slate-700 transition-colors hover:text-red-600 sm:w-36 sm:text-xs sm:tracking-[0.32em]"
        aria-label={`Abrir ${social.name} do Trama em uma nova aba`}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-red-600 transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
          {social.icon}
        </span>
        <span className="font-semibold">{social.name}</span>
      </a>
    ))}
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'Data em breve';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (_error) {
    return 'Data em breve';
  }
};

const PostCard = ({ post }) => {
  const coverImage = resolveAssetUrl(post.coverImage);
  const editoriaSlug = post.editoriaId?.slug || post.editoriaId?.slugify;
  const articleSlug = post.slug;
  const href = editoriaSlug && articleSlug ? `/editorias/${editoriaSlug}/${articleSlug}` : '#';
  const hasLink = href !== '#';

  return (
    <article className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[2.5rem] border border-black/10 bg-black text-white shadow-[0_30px_60px_rgba(0,0,0,0.38)] transition-transform duration-300 hover:-translate-y-1 sm:min-h-[360px]">
      <div className="absolute inset-0" aria-hidden="true">
        {coverImage ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              filter: 'grayscale(100%)',
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-xs uppercase tracking-[0.4em] text-neutral-400">
            Sem imagem
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
      </div>

      <div className="relative z-10 flex h-full flex-col gap-5 px-6 pb-8 pt-10 text-left sm:px-8 sm:pb-10 sm:pt-12">
        <span className="text-[0.7rem] uppercase tracking-[0.26em] text-red-300">
          {post.editoriaId?.title || 'Editorial'}
        </span>
        <h3 className="text-2xl font-serif leading-tight md:text-3xl">{post.title}</h3>
        {post.summary && (
          <p className="text-sm leading-relaxed text-gray-200 md:text-base">
            {post.summary}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-gray-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
          {post.stats?.views !== undefined && post.stats.views !== null && (
            <span>{post.stats.views} visualizações</span>
          )}
        </div>
        {hasLink && (
          <div>
            <Link
              href={href}
              className="inline-flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.26em] text-red-200 transition-colors hover:text-white"
            >
              <span>Continuar lendo</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default function UltimasPostagens({ posts = [] }) {
  const hasPosts = posts.length > 0;

  return (
    <section
      id="ultimas-postagens"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#fdf7f7] to-[#f1efef] py-24 text-slate-900 md:py-32"
    >
      <div className="pattern-stars pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6">
        {hasPosts ? (
          <div className="text-center md:text-left">
            <span className="font-serif text-[0.75rem] uppercase tracking-[0.35em] text-slate-500 md:text-xs md:tracking-[0.45em]">
              Últimas publicações
            </span>
            <h2 className="mt-3 text-4xl font-script text-red-600 md:text-5xl">Em cartaz no Trama</h2>
            <p className="mt-4 max-w-3xl text-sm text-slate-600 md:text-base">
              Acompanhe o fluxo de notícias e relatos que investigam o audiovisual. Selecionamos as pautas mais recentes para você ler como em um caderno cultural.
            </p>
          </div>
        ) : (
          <div className="mx-auto mb-20 max-w-3xl rounded-[2.75rem] border border-black/10 bg-white/90 px-10 py-14 text-center text-base leading-relaxed text-slate-600 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur">
            <p>
              Ainda não temos publicações por aqui, mas a redação já está em movimento. Assim que os primeiros textos forem liberados, eles aparecerão automaticamente nesta vitrine.
            </p>
          </div>
        )}

        {hasPosts && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        <div className="relative flex flex-col items-center rounded-[3rem] border border-black/10 bg-white/90 px-8 py-16 text-center shadow-[0_30px_60px_rgba(0,0,0,0.12)] backdrop-blur sm:px-10">
          <p className="text-[0.75rem] uppercase tracking-[0.35em] text-slate-500 md:text-xs md:tracking-[0.45em]">Confira</p>
          <h3 className="mt-2 text-5xl font-script text-red-600 md:text-6xl">Nossas Redes</h3>
          <p className="mt-4 max-w-xl text-sm text-slate-600 md:text-base">
            Bastidores, coberturas ao vivo e curiosidades exclusivas continuam nos nossos canais. Siga o Trama e leve o jornalismo cultural para o seu feed diário.
          </p>

          <SocialLinks />

          <div className="mt-14 flex w-full max-w-xl flex-col items-center gap-6">
            <div className="relative w-full">
              <div className="filmstrip-bar" aria-hidden="true" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-serif uppercase tracking-[0.6em] text-white">Trama</span>
              </div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                <CameraIcon className="h-24 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
