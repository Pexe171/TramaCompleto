import Link from 'next/link';

import { resolveAssetUrl } from '@/lib/apiClient';

const DecorativeStar = ({ className }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M32 0L39.28 18.72 58 26 39.28 33.28 32 52 24.72 33.28 6 26l18.72-7.28L32 0Z"
      fill="currentColor"
    />
  </svg>
);

const formatEditorias = (editorias) => {
  if (!Array.isArray(editorias)) {
    return [];
  }

  return editorias
    .filter((editoria) => Boolean(editoria))
    .map((editoria) => ({
      title: editoria.title,
      coverImage: resolveAssetUrl(editoria.coverImage) || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png',
      coverFocusX: editoria.coverImageFocusX ?? 50,
      coverFocusY: editoria.coverImageFocusY ?? 50,
      coverScale: editoria.coverImageScale ?? 100,
      descriptionImage: editoria.descriptionImage ? resolveAssetUrl(editoria.descriptionImage) : null,
      href: editoria.slug ? `/editorias/${editoria.slug}` : '#',
    }));
};

export default function NossasEditorias({ editorias }) {
  const items = formatEditorias(editorias);

  const renderContent = () => (
    <div className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute -top-12 right-12 hidden h-12 w-12 text-red-500/40 md:block">
        <DecorativeStar className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute -bottom-10 left-4 hidden h-10 w-10 text-slate-900/30 lg:block">
        <DecorativeStar className="h-full w-full" />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {items.map((editoria, index) => {
          const isLastOdd = items.length % 2 !== 0 && index === items.length - 1;

          return (
            <div
              key={`${editoria.title}-${index}`}
              className={`flex justify-center ${isLastOdd ? 'md:col-span-2' : ''}`}
            >
              <Link
                href={editoria.href}
                className="group relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2.75rem] border border-black/10 bg-black text-white shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className="relative h-64 w-full overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 bg-neutral-900"
                    style={{
                      backgroundImage: `url(${editoria.coverImage})`,
                      backgroundPosition: `${editoria.coverFocusX}% ${editoria.coverFocusY}%`,
                      backgroundSize: `${editoria.coverScale}%`,
                      backgroundRepeat: 'no-repeat',
                      filter: 'grayscale(100%)',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  {editoria.descriptionImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <img
                        src={editoria.descriptionImage}
                        alt={`Descrição visual da editoria ${editoria.title}`}
                        className="max-h-[70%] max-w-[70%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 px-8 py-6">
                  <span className="text-xs uppercase tracking-[0.4em] text-red-400">Editoria</span>
                  <span className="text-xl font-serif uppercase tracking-[0.2em] text-white">
                    {editoria.title}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      id="editorias"
      className="relative overflow-hidden bg-white py-24 text-slate-900 md:py-32"
    >
      <div className="pattern-stars pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <div className="relative mb-16 inline-flex flex-col items-center gap-3">
          <span className="font-serif text-sm uppercase tracking-[0.45em] text-slate-500">
            Conheça as nossas
          </span>
          <h2 className="text-5xl font-script text-red-600 md:text-6xl">Editorias</h2>
        </div>

        {items.length ? (
          renderContent()
        ) : (
          <div className="relative mx-auto max-w-3xl rounded-[2.75rem] border border-black/10 bg-white/90 px-10 py-14 text-base leading-relaxed text-slate-600 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur">
            <p>
              As editorias ainda estão em preparação. Assim que forem publicadas no painel administrativo, elas aparecerão aqui com todas as capas, descrições e links para as reportagens.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
