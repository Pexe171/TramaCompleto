import '../globals.css'; // Caminho corrigido para a pasta raiz

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
      <body className="font-sans bg-black text-white">{children}</body>
    </html>
  );
}

