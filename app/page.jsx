'use client';

import QuemSomos from '../components/QuemSomos';
import NossasEditorias from '../components/NossasEditorias';

const Header = () => (
  <header className="absolute top-0 right-0 p-4 md:p-6 z-20 w-full flex justify-end">
    <a href="/acesso" className="border border-white text-white px-6 py-2 rounded-full text-sm font-sans uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
      Acessar
    </a>
  </header>
);

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Header />

      {/* Seção Principal com a imagem de fundo */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.postimg.cc/0QRV89sD/IMG-1758-1.jpg"
            alt="Fundo com colagem de cenas de filmes em preto e branco"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
        </div>

        <div className="relative z-10 p-4 w-11/12 max-w-lg">
          <img
            src="https://i.postimg.cc/0yhff9rh/Layout-trama-png-1.png"
            alt="Logo TRAMA estilizado com uma câmera de cinema vermelha"
            className="max-w-full h-auto"
          />
        </div>
      </section>

      <QuemSomos />

      <NossasEditorias />
    </main>
  );
}

