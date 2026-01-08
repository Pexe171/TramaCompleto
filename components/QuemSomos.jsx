"use client";

import { useRef, useState, useEffect } from 'react';

// ATENÇÃO: Se as imagens não carregarem, substitua estes links pelos links diretos (que terminam em .jpg ou .png)
const defaultImages = [
  'https://i.ibb.co/jsLKSX3/4.png',
  'https://i.ibb.co/Q74PTQ9Q/5.png',
  'https://i.ibb.co/931YSDLw/6.png',
  'https://i.ibb.co/f51mtDr/7.png',
  'https://i.ibb.co/wHZpVS1/8.png',
  'https://i.ibb.co/XrpC35k8/9.png',
  'https://i.ibb.co/rRCQXB6v/10.png',
  'https://i.ibb.co/Qv0Qjg1B/11.png',
  'https://i.ibb.co/Gv0TYj4K/12.png',
  'https://i.ibb.co/mCffM9Ft/13.png',
  'https://i.ibb.co/QjDhg0XX/14.png',
  'https://i.ibb.co/fGvqDqDf/15.png',
  'https://i.ibb.co/gLf4Xzjf/16.png',
  'https://i.ibb.co/DfVc3Xr5/17.png',
  'https://i.ibb.co/B2DPgt8p/18.png',
  'https://i.ibb.co/9x54cbN/19.png',
  'https://i.ibb.co/cSbPFNS8/20.png',
  'https://i.ibb.co/66ZmQKs/21.png',
  'https://i.ibb.co/67xxBqf5/1.png',
  'https://i.ibb.co/v6Fbh3vn/2.png',
  'https://i.ibb.co/mrL4dcbx/3.png',
];


const splitTitle = (rawTitle) => {
  if (!rawTitle) {
    return { highlight: 'Quem', remainder: 'Somos' };
  }

  const parts = rawTitle.split(' ');
  if (parts.length === 1) {
    return { highlight: parts[0], remainder: '' };
  }

  const [highlight, ...rest] = parts;
  return { highlight, remainder: rest.join(' ') };
};

export default function QuemSomos({ title = 'Quem Somos?', contentHtml, teamImages = defaultImages }) {
  // Se forem passadas imagens via props, usa elas; senão, usa a lista padrão nova
  const carouselImages = teamImages?.length ? teamImages : defaultImages;
  
  const formattedTitle = splitTitle(title);
  const carouselRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const isAtStart = el.scrollLeft === 0;
    // Pequena margem de erro (-2) para garantir que detecte o fim em diferentes resoluções
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2; 
    setShowPrev(!isAtStart);
    setShowNext(!isAtEnd);
  };
  
  const scroll = (direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    const newScrollLeft = el.scrollLeft + (direction === 'next' ? scrollAmount : -scrollAmount);
    el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };
  
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    
    handleScroll(); // Verifica no render inicial
    el.addEventListener('scroll', handleScroll);
    
    // Verifica novamente após um tempo para garantir que o layout estabilizou
    const checkOnLoad = () => setTimeout(handleScroll, 500);
    window.addEventListener('load', checkOnLoad)

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', checkOnLoad);
    };
  }, [carouselImages]);

  return (
    <section id="quem-somos" className="py-20 md:py-32 bg-black text-gray-200 overflow-hidden">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <h2 className="text-6xl md:text-7xl font-serif mb-4">
          <span className="font-script text-red-500 text-8xl">{formattedTitle.highlight}</span>{' '}
          {formattedTitle.remainder}
        </h2>

        <div className="relative mb-24">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <img
              src="https://i.postimg.cc/JzhT4TB6/ID-VISUAL-TRAMA-7-3.png"
              alt="Ícone Trama"
              className="w-28 h-28 drop-shadow-[0_0_15px_#e63946]"
            />
          </div>
          <div className="bg-gray-900/50 pt-24 pb-12 px-8 rounded-3xl space-y-4">
            {contentHtml ? (
              <div
                className="text-xl md:text-2xl leading-relaxed text-gray-300 space-y-4"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="text-xl md:text-2xl leading-relaxed text-gray-300">
                Somos o <span className="text-red-500 font-semibold">Trama</span>, um portal de cinema e comunicação criado por estudantes de Relações Públicas da UFAM, apaixonados pela sétima arte. Nosso objetivo é explorar as estratégias de comunicação que conectam o público ao universo cinematográfico.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-4xl md:text-5xl font-serif mb-12 text-center">Nossa Equipe</h3>
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <div
            ref={carouselRef}
            className="flex gap-8 py-2 overflow-x-auto no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {carouselImages.map((src, index) => (
              <div key={`${src}-${index}`} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <img
                  src={src}
                  alt={`Integrante da equipe Trama ${index + 1}`}
                  className="w-64 h-64 md:w-72 md:h-72 object-cover rounded-full shadow-lg shadow-red-500/20"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          
          {showPrev && (
            <button 
              onClick={() => scroll('prev')}
              className="absolute top-1/2 left-0 md:-left-4 -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 text-white w-12 h-12 rounded-full flex items-center justify-center transition-opacity z-10"
              aria-label="Anterior"
            >
              &#x2190;
            </button>
          )}

          {showNext && (
            <button 
              onClick={() => scroll('next')}
              className="absolute top-1/2 right-0 md:-right-4 -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 text-white w-12 h-12 rounded-full flex items-center justify-center transition-opacity z-10"
              aria-label="Próximo"
            >
              &#x2192;
            </button>
          )}

        </div>
      </div>
    </section>
  );
}