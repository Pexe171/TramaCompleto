import Link from 'next/link';

import NossasEditorias from '../components/NossasEditorias';
import QuemSomos from '../components/QuemSomos';
import UltimasPostagens from '../components/UltimasPostagens';
import { API_BASE_URL, resolveAssetUrl } from '@/lib/apiClient';

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

const HeroSection = ({ editoria }) => {
  const coverImage = editoria?.coverImage ? resolveAssetUrl(editoria.coverImage) : HEADER_BACKGROUND;
  const coverFocusX = editoria?.coverImageFocusX ?? 50;
  const coverFocusY = editoria?.coverImageFocusY ?? 50;
  const coverScale = editoria?.coverImageScale ?? 100;
  const coverStyle = {
    backgroundImage: `url(${coverImage})`,
    backgroundPosition: `${coverFocusX}% ${coverFocusY}%`,
    backgroundSize: `${coverScale}%`,
    backgroundRepeat: 'no-repeat',
  };
  const descriptionImage = editoria?.descriptionImage ? resolveAssetUrl(editoria.descriptionImage) : null;
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
        {editoria && (
          <div className="bg-black/60 border border-red-500/40 rounded-3xl p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-red-400">Em destaque</p>
            <h1 className="text-3xl md:text-4xl font-serif">{editoria.title}</h1>
            {descriptionImage ? (
              <div className="rounded-2xl overflow-hidden border border-red-500/30 bg-black/40">
                <img
                  src={descriptionImage}
                  alt={`Descrição visual da editoria ${editoria.title}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <p className="text-sm md:text-base text-gray-300">
                A editoria está pronta para receber uma descrição visual no painel administrativo.
              </p>
            )}
            {editoria.slug && (
              <Link
                href={`/editorias/${editoria.slug}`}
                className="inline-flex items-center space-x-2 text-sm uppercase tracking-widest text-red-400 hover:text-red-300"
              >
                <span>Explorar editoria</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default async function HomePage() {
  const [homeData, editoriasData, quemSomosData, latestEditoria] = await Promise.all([
    fetchFromApi('/home'),
    fetchFromApi('/editorias'),
    fetchFromApi('/quem-somos'),
    fetchFromApi('/latest-editoria', { revalidate: 120 }),
  ]);

  const ultimasPostagens = homeData?.ultimasPostagens || [];
  const editorias = editoriasData || [];
  const quemSomosTitle = quemSomosData?.title || 'Quem Somos?';
  const quemSomosContent = quemSomosData?.content || null;

  return (
    <main className="bg-black text-white">
      <Header />
      <HeroSection editoria={latestEditoria} />
      <QuemSomos title={quemSomosTitle} contentHtml={quemSomosContent} />
      <NossasEditorias editorias={editorias} />
      <UltimasPostagens posts={ultimasPostagens} />
    </main>
  );
}
