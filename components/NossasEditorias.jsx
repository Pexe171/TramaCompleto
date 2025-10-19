import { resolveAssetUrl } from '../lib/apiClient';

const fallbackEditorias = [
  { titulo: 'Cine Movimento', imagem: 'https://i.postimg.cc/L86v3b0g/CINE-MOVIMENTO.jpg', slug: '#' },
  { titulo: 'De Volta Para o Futuro', imagem: 'https://i.postimg.cc/Bv5Wk0H1/DE-VOLTA-PRO-FUTURO.jpg', slug: '#' },
  { titulo: 'Vale o Ingresso?', imagem: 'https://i.postimg.cc/W3h09V13/VALE-O-INGRESSO.jpg', slug: '#' },
  { titulo: 'Furo de Roteiro', imagem: 'https://i.postimg.cc/J4sPjJ94/FURO-DE-ROTEIRO.jpg', slug: '#' },
  { titulo: 'Personas em Cena', imagem: 'https://i.postimg.cc/d11v9s8z/PERSONAS-EM-CENA.jpg', slug: '#' },
  { titulo: 'Clube da Notícia', imagem: 'https://i.postimg.cc/L58k5Jk9/CLUBE-DA-NOTICIA.jpg', slug: '#' },
  { titulo: 'Por Trás do Cartaz', imagem: 'https://i.postimg.cc/1X6Gv6vS/POR-TRAS-DO-CARTAZ.jpg', slug: '#' },
];

const formatEditorias = (editorias) => {
  if (!Array.isArray(editorias) || !editorias.length) {
    return fallbackEditorias.map((item) => ({
      title: item.titulo,
      coverImage: item.imagem,
      href: item.slug,
    }));
  }

  return editorias.map((editoria) => ({
    title: editoria.title,
    coverImage: resolveAssetUrl(editoria.coverImage) || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png',
    href: editoria.slug ? `/editorias/${editoria.slug}` : '#',
  }));
};

export default function NossasEditorias({ editorias }) {
  const items = formatEditorias(editorias);

  return (
    <section id="editorias" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-6xl md:text-7xl font-serif mb-16">
          <span className="font-script text-red-500 text-8xl">Nossas</span> Editorias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 max-w-5xl mx-auto">
          {items.map((editoria, index) => (
            <div
              key={`${editoria.title}-${index}`}
              className={`flex flex-col items-center ${items.length % 2 !== 0 && index === items.length - 1 ? 'md:col-span-2' : ''}`}
            >
              <div className={items.length % 2 !== 0 && index === items.length - 1 ? 'w-full md:w-1/2' : 'w-full'}>
                <a
                  href={editoria.href}
                  className="block group aspect-video rounded-[3rem] overflow-hidden relative shadow-lg shadow-black/50 hover:shadow-red-500/30 transition-shadow duration-300"
                >
                  <img
                    src={editoria.coverImage}
                    alt={`Capa da editoria ${editoria.title}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </a>
                <h4 className="font-sans uppercase tracking-widest text-sm mt-4 text-gray-300">{editoria.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
