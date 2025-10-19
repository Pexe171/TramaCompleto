// Componente NossasEditorias
export default function NossasEditorias() {
  // Dados das editorias com as imagens de capa
  const editorias = [
    { titulo: 'Cine Movimento', imagem: 'https://i.postimg.cc/L86v3b0g/CINE-MOVIMENTO.jpg' },
    { titulo: 'De Volta Para o Futuro', imagem: 'https://i.postimg.cc/Bv5Wk0H1/DE-VOLTA-PRO-FUTURO.jpg' },
    { titulo: 'Vale o Ingresso?', imagem: 'https://i.postimg.cc/W3h09V13/VALE-O-INGRESSO.jpg' },
    { titulo: 'Furo de Roteiro', imagem: 'https://i.postimg.cc/J4sPjJ94/FURO-DE-ROTEIRO.jpg' },
    { titulo: 'Personas em Cena', imagem: 'https://i.postimg.cc/d11v9s8z/PERSONAS-EM-CENA.jpg' },
    { titulo: 'Clube da Notícia', imagem: 'https://i.postimg.cc/L58k5Jk9/CLUBE-DA-NOTICIA.jpg' },
    { titulo: 'Por Trás do Cartaz', imagem: 'https://i.postimg.cc/1X6Gv6vS/POR-TRAS-DO-CARTAZ.jpg' },
  ];

  return (
    <section id="editorias" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-6xl md:text-7xl font-serif mb-16">
          <span className="font-script text-red-500 text-8xl">Nossas</span> Editorias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 max-w-5xl mx-auto">
          {editorias.map((editoria, index) => (
            <div 
              key={index} 
              // Se for o último item e o número de itens for ímpar, ele ocupará duas colunas para permitir a centralização.
              className={`flex flex-col items-center ${editorias.length % 2 !== 0 && index === editorias.length - 1 ? 'md:col-span-2' : ''}`}
            >
              {/* Este div interno controla a largura do último item para que ele fique centralizado. */}
              <div className={editorias.length % 2 !== 0 && index === editorias.length - 1 ? 'w-full md:w-1/2' : 'w-full'}>
                {/* O link agora define o formato retangular e contém a imagem */}
                <a href="#" className="block group aspect-video rounded-[3rem] overflow-hidden relative shadow-lg shadow-black/50 hover:shadow-red-500/30 transition-shadow duration-300">
                  <img 
                    src={editoria.imagem} 
                    alt={`Capa da editoria ${editoria.titulo}`}
                    // A imagem preenche o container retangular, cortando o excesso se necessário.
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </a>
                <h4 className="font-sans uppercase tracking-widest text-sm mt-4 text-gray-300">{editoria.titulo}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

