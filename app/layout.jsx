import '../globals.css'; // Caminho corrigido para a pasta raiz

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M12 2.162c3.204 0 3.584.012 4.85.07 1.17.055 1.97.24 2.43.401a4.915 4.915 0 0 1 1.78 1.155 4.915 4.915 0 0 1 1.155 1.78c.16.46.346 1.26.401 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.97-.401 2.43a4.915 4.915 0 0 1-1.155 1.78 4.915 4.915 0 0 1-1.78 1.155c-.46.16-1.26.346-2.43.401-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.97-.24-2.43-.401a4.915 4.915 0 0 1-1.78-1.155 4.915 4.915 0 0 1-1.155-1.78c-.16-.46-.346-1.26-.401-2.43C2.174 15.584 2.162 15.204 2.162 12s.012-3.584.07-4.85c.055-1.17.24-1.97.401-2.43a4.915 4.915 0 0 1 1.155-1.78 4.915 4.915 0 0 1 1.78-1.155c.46-.16 1.26-.346 2.43-.401C8.416 2.174 8.796 2.162 12 2.162zm0-2.162C8.741 0 8.332.014 7.052.072 5.772.129 4.84.322 4.05.61a7.078 7.078 0 0 0-2.56 1.66A7.078 7.078 0 0 0-.07 4.83c-.287.79-.48 1.722-.538 3.002C-.666 9.112-.68 9.521-.68 12c0 2.479.014 2.888.072 4.168.057 1.28.25 2.212.538 3.002a7.078 7.078 0 0 0 1.66 2.56 7.078 7.078 0 0 0 2.56 1.66c.79.287 1.722.48 3.002.538C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.28-.057 2.212-.25 3.002-.538a7.078 7.078 0 0 0 2.56-1.66 7.078 7.078 0 0 0 1.66-2.56c.287-.79.48-1.722.538-3.002.057-1.28.072-1.689.072-4.168 0-2.479-.014-2.888-.072-4.168-.057-1.28-.25-2.212-.538-3.002a7.078 7.078 0 0 0-1.66-2.56 7.078 7.078 0 0 0-2.56-1.66c-.79-.287-1.722-.48-3.002-.538C15.668.014 15.259 0 12 0z" />
    <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    <circle cx="18.406" cy="5.594" r="1.44" />
  </svg>
);

const Footer = () => (
  <footer className="border-t border-red-500/30 bg-black/80 py-8 text-center text-xs text-gray-400 sm:text-sm">
    <div className="flex flex-col items-center gap-3 px-4 sm:flex-row sm:justify-center sm:gap-4">
      <span className="text-gray-300">Direitos autorais © Desenvolvido por David Henrique - Engenheiro de Software</span>
      <a
        href="https://www.instagram.com/david.devloli"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir Instagram de David Henrique em nova aba"
        className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-300 transition-colors hover:border-red-400/60 hover:text-red-200"
      >
        <InstagramIcon />
        <span>@david.devloli</span>
      </a>
    </div>
  </footer>
);

export const metadata = {
  title: 'Trama - Portal de Cinema e Comunicação',
  description: 'Um portal sobre cinema e comunicação criado por estudantes da UFAM',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning={true} // Mantido para evitar avisos de hidratação
    >
      <head>
        {/* Importação direta das fontes para compatibilidade com o preview */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&family=Playfair+Display:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* As classes de fonte serão aplicadas via tailwind.config.js */}
      <body className="font-sans bg-black text-white">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}

