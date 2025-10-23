import Link from 'next/link';

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

const splitTitle = (rawTitle) => {
  if (!rawTitle) {
    return { highlight: 'Quem', remainder: 'Somos?' };
  }

  const parts = rawTitle.trim().split(/\s+/);
  if (parts.length === 1) {
    return { highlight: parts[0], remainder: '' };
  }

  const [highlight, ...rest] = parts;
  const remainder = rest.join(' ');
  return { highlight, remainder };
};

const defaultContent = `
  <p>
    Somos o <strong>Trama</strong>, um portal de cinema e comunicação criado por estudantes de
    Relações Públicas da UFAM. Apaixonados pela sétima arte, investigamos estratégias de
    comunicação que conectam o público a grandes narrativas audiovisuais.
  </p>
  <p>
    Entre entrevistas, críticas, listas e curiosidades, exploramos os bastidores da produção
    cinematográfica e os impactos culturais que nascem nas telas. Nosso compromisso é contar boas
    histórias com sensibilidade, técnica e um olhar amazônico.
  </p>
`;

export default function QuemSomos({ title = 'Quem Somos?', contentHtml }) {
  const formattedTitle = splitTitle(title);
  const resolvedContent = contentHtml || defaultContent;

  return (
    <section
      id="quem-somos"
      className="relative overflow-hidden bg-[#fdf7f7] py-28 text-slate-900"
    >
      <div className="pattern-stars pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <div className="relative inline-flex flex-col items-center gap-6">
          <div className="absolute -top-10 left-1/2 h-44 w-44 -translate-x-1/2 opacity-90">
            <img
              src="https://i.postimg.cc/JzhT4TB6/ID-VISUAL-TRAMA-7-3.png"
              alt=""
              className="h-full w-full object-contain"
              aria-hidden="true"
            />
          </div>

          <h2 className="relative flex flex-col items-center gap-2 text-5xl md:text-6xl">
            <span className="font-script text-7xl text-red-600 md:text-8xl">{formattedTitle.highlight}</span>
            <span className="font-serif uppercase tracking-[0.35em] text-slate-900 md:text-[2.75rem]">
              {formattedTitle.remainder || 'Somos?'}
            </span>
          </h2>

          <div className="pointer-events-none absolute -left-16 top-12 hidden h-12 w-12 text-red-500/60 sm:block">
            <DecorativeStar className="h-full w-full" />
          </div>
          <div className="pointer-events-none absolute -right-16 top-4 hidden h-10 w-10 text-slate-900/40 md:block">
            <DecorativeStar className="h-full w-full" />
          </div>
        </div>

        <div className="relative mt-16 w-full max-w-3xl">
          <div className="absolute -top-12 -left-12 h-28 w-28 rotate-12 rounded-full bg-red-500/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-12 -right-10 h-24 w-24 -rotate-6 rounded-full bg-red-400/20 blur-3xl" aria-hidden="true" />

          <div className="relative rounded-[3rem] border border-black/5 bg-white/90 px-10 py-14 text-lg leading-relaxed shadow-[0_30px_60px_rgba(0,0,0,0.08)] backdrop-blur">
            <div
              className="space-y-6 text-justify text-base leading-relaxed text-slate-700 md:text-lg"
              dangerouslySetInnerHTML={{ __html: resolvedContent }}
            />
          </div>

          <div className="pointer-events-none absolute -right-20 -bottom-16 hidden h-24 w-24 rotate-6 text-red-500/50 lg:block">
            <DecorativeStar className="h-full w-full" />
          </div>
        </div>

        <Link
          href="#editorias"
          className="mt-14 inline-flex flex-col items-center gap-2 text-sm uppercase tracking-[0.45em] text-slate-800 transition-colors hover:text-red-600"
        >
          <span className="font-serif text-base text-slate-500">Conheça as nossas</span>
          <span className="font-script text-5xl text-red-600 md:text-6xl">Editorias</span>
        </Link>
      </div>
    </section>
  );
}
