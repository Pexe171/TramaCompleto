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
    <strong>Trama</strong> é uma redação-laboratório criada por estudantes de Relações Públicas da UFAM que encontrou no
    jornalismo cultural um caminho para dar visibilidade às histórias que nascem nas salas de cinema, nas telas
    alternativas e nas produções independentes da Amazônia.
  </p>
  <p>
    Produzimos reportagens, entrevistas, críticas e especiais que investigam o audiovisual para além da estreia. Cada
    texto é feito com rigor jornalístico, pesquisa e afeto por quem consome cultura, sempre com linguagem acessível e
    contextos que situam o leitor.
  </p>
  <p>
    Também atuamos como ponte entre criadores, públicos e iniciativas da região. Contamos o que acontece por trás das
    câmeras, resgatamos memórias e acompanhamos o impacto que o cinema provoca em Manaus e no Brasil.
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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 md:grid md:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] md:items-start md:gap-20">
        <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
          <div className="absolute -top-12 left-1/2 h-40 w-40 -translate-x-1/2 opacity-90 md:left-0 md:translate-x-0">
            <img
              src="https://i.postimg.cc/JzhT4TB6/ID-VISUAL-TRAMA-7-3.png"
              alt="Símbolo ilustrado do projeto Trama"
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-24 flex flex-col items-center gap-2 text-4xl md:items-start md:text-left md:text-5xl">
            <span className="font-script text-6xl text-red-600 md:text-7xl">{formattedTitle.highlight}</span>
            <span className="font-serif uppercase tracking-[0.28em] text-slate-900 md:text-[2.5rem]">
              {formattedTitle.remainder || 'Somos?'}
            </span>
          </h2>

          <p className="mt-6 max-w-md text-sm text-slate-600 md:text-base">
            Um coletivo universitário que acredita no jornalismo cultural como ferramenta para iluminar o audiovisual da Amazônia.
          </p>

          <div className="pointer-events-none absolute -left-10 top-16 hidden h-12 w-12 text-red-500/60 sm:block">
            <DecorativeStar className="h-full w-full" />
          </div>
          <div className="pointer-events-none absolute right-6 top-6 hidden h-10 w-10 text-slate-900/40 md:block">
            <DecorativeStar className="h-full w-full" />
          </div>

          <Link
            href="#editorias"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-red-500/50 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-red-600 transition-colors hover:border-red-600 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            <span>Conhecer editorias</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className="relative w-full">
          <div className="absolute -top-12 -left-12 h-28 w-28 rotate-12 rounded-full bg-red-500/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-12 -right-10 h-24 w-24 -rotate-6 rounded-full bg-red-400/20 blur-3xl" aria-hidden="true" />

          <div className="relative rounded-[2.75rem] border border-black/5 bg-white/95 px-8 py-12 text-base leading-relaxed shadow-[0_30px_60px_rgba(0,0,0,0.08)] backdrop-blur sm:px-10 sm:py-14">
            <div
              className="space-y-6 text-left text-base leading-relaxed text-slate-700 md:text-lg"
              dangerouslySetInnerHTML={{ __html: resolvedContent }}
            />
          </div>

          <div className="pointer-events-none absolute -right-16 -bottom-16 hidden h-24 w-24 rotate-6 text-red-500/50 lg:block">
            <DecorativeStar className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
