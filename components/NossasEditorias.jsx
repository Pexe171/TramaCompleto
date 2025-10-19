import { resolveAssetUrl } from '../lib/apiClient';

const formatEditorias = (editorias) => {
  if (!Array.isArray(editorias)) {
    return [];
  }

  return editorias
    .filter((editoria) => Boolean(editoria))
    .map((editoria) => ({
      title: editoria.title,
      coverImage: resolveAssetUrl(editoria.coverImage) || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png',
      href: editoria.slug ? `/editorias/${editoria.slug}` : '#',
    }));
};

export default function NossasEditorias({ editorias }) {
  const items = formatEditorias(editorias);

  if (!items.length) {
    return (
      <section id="editorias" className="py-20 md:py-32 bg-black text-white">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-serif">
            <span className="font-script text-red-500 text-7xl">Nossas</span> Editorias
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Assim que as primeiras editorias forem publicadas pelo sistema de gestão, elas aparecerão por aqui.
          </p>
        </div>
      </section>
    );
  }

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
