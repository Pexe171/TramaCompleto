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

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Quem Somos', href: '#quem-somos' },
  { label: 'Editorias', href: '#editorias' },
  { label: 'Postagens', href: '#ultimas-postagens' },
  { label: 'Newsletter', href: '/acesso?tab=newsletter' },
];

const Header = ({ editorias = [] }) => {
  const editoriaLinks = editorias
    .filter((editoria) => editoria?.slug && editoria?.title)
    .slice(0, 4)
    .map((editoria) => ({
      label: editoria.title,
      href: `/editorias/${editoria.slug}`,
    }));

  const links = [...NAV_LINKS.slice(0, 4), ...editoriaLinks, NAV_LINKS[4]];

  return (
    <header className="fixed top-0 left-0 right-0 z-30">
      <div className="pointer-events-none mx-auto flex w-full max-w-6xl justify-center px-4 pt-6">
        <nav className="pointer-events-auto flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-white/20 bg-black/60 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white backdrop-blur-md transition-colors md:text-sm">
          {links.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:text-red-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const coverStyle = {
    backgroundImage: `url(${HEADER_BACKGROUND})`,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-40" style={coverStyle} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute -top-24 -left-16 h-96 w-96 rounded-full bg-red-600/30 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 -right-12 h-96 w-96 rounded-full bg-red-500/20 blur-3xl" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto w-11/12 max-w-4xl space-y-6 px-4 text-center">
        <img
          src={LOGO_URL}
          alt="Logo TRAMA estilizado com uma câmera de cinema vermelha"
          className="mx-auto h-auto w-full max-w-3xl drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
        />
        <p className="mx-auto max-w-xl text-sm uppercase tracking-[0.4em] text-gray-200">
          Portal de cinema, comunicação e cultura em Manaus
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="filmstrip-bar" aria-hidden="true" />
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
    <main className="bg-[#faf7f7] text-black">
      <Header editorias={editorias} />
      <HeroSection />
      <QuemSomos title={quemSomosTitle} contentHtml={quemSomosContent} />
      <NossasEditorias editorias={editorias} />
      <UltimasPostagens posts={ultimasPostagens} />
    </main>
  );
}
