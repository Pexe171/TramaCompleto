import Link from 'next/link';

import NossasEditorias from '../components/NossasEditorias';
import QuemSomos from '../components/QuemSomos';
import UltimasPostagens from '../components/UltimasPostagens';
import { API_BASE_URL } from '@/lib/apiClient';

const HEADER_BACKGROUND = 'https://i.postimg.cc/0QRV89sD/IMG-1758-1.jpg';
const LOGO_URL = 'https://i.postimg.cc/0yhff9rh/Layout-trama-png-1.png';

const fetchFromApi = async (endpoint, options = {}) => {
  try {
    const fetchOptions = {};

    if (options.cache === 'no-store') {
      fetchOptions.cache = 'no-store';
    } else {
      fetchOptions.next = { revalidate: options.revalidate ?? 60 };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Falha ao carregar ${endpoint}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[API] Erro ao carregar', endpoint, error);
    return null;
  }
};

const Header = () => (
  <header className="absolute top-0 right-0 p-4 md:p-6 z-20 w-full flex justify-end">
    <Link
      href="/acesso"
      className="border border-white text-white px-6 py-2 rounded-full text-sm font-sans uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
    >
      Acessar
    </Link>
  </header>
);

const HeroSection = () => {
  const coverStyle = {
    backgroundImage: `url(${HEADER_BACKGROUND})`,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30" style={coverStyle} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 p-4 w-11/12 max-w-3xl space-y-8 text-center">
        <img
          src={LOGO_URL}
          alt="Logo TRAMA estilizado com uma câmera de cinema vermelha"
          className="max-w-full h-auto mx-auto"
        />
      </div>
    </section>
  );
};

export default async function HomePage() {
  const [homeData, editoriasData, quemSomosData] = await Promise.all([
    fetchFromApi('/home'),
    fetchFromApi('/editorias'),
    fetchFromApi('/quem-somos'),
  ]);

  const ultimasPostagens = homeData?.ultimasPostagens || [];
  const editorias = editoriasData || [];
  const quemSomosTitle = quemSomosData?.title || 'Quem Somos?';
  const quemSomosContent = quemSomosData?.content || null;

  return (
    <main className="bg-black text-white">
      <Header />
      <HeroSection />
      <QuemSomos title={quemSomosTitle} contentHtml={quemSomosContent} />
      <NossasEditorias editorias={editorias} />
      <UltimasPostagens posts={ultimasPostagens} />
    </main>
  );
}
