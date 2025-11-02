"use client";

import { useRef, useState, useEffect } from 'react';

const defaultImages = [
  'https://www.imglink.io/i/2eaf6a5a-b451-4710-9bb2-fe0d2e557609.jpg',
  'https://www.imglink.io/i/5686fb6d-aefb-4d64-be4a-c6436633d5da.png',
  'https://www.imglink.io/i/f417bd19-b749-45d7-99fb-58fcabc2a5d8.jpg',
  'https://www.imglink.io/i/2f3d802c-cba6-4b9e-a1d7-67bac2fda5aa.jpg',
  'https://www.imglink.io/i/92a028c1-7664-4544-a758-50cbd772a771.jpg',
  'https://www.imglink.io/i/32ad4dc9-d9f8-4d18-867c-6c882d083d76.jpg',
  'https://www.imglink.io/i/41fa1c06-fc3c-4711-b740-c9b1edd6b364.jpg',
  'https://www.imglink.io/i/aa20b0b5-d59d-4a44-bd70-320e8d74aacb.jpg',
  'https://www.imglink.io/i/6ca26850-0c6a-4d9e-9b65-de87bc421fa6.jpg',
  'https://www.imglink.io/i/f4efaed3-fd42-4071-8242-6fef2d50e29b.jpg',
  'https://www.imglink.io/i/3ad10f61-29e7-4438-ba71-c574a810b2f7.jpg',
  'https://www.imglink.io/i/ddac4276-b588-4957-92df-16d3bd58a805.jpg',
  'https://www.imglink.io/i/be65b483-490e-4628-b698-a5b9190acf50.jpg',
  'https://www.imglink.io/i/970f1134-8aa1-4e12-a247-6e5396c192df.jpg',
  'https://www.imglink.io/i/f69a8c6a-1435-47d4-a08b-9b347c6f6bd4.jpg',
  'https://www.imglink.io/i/de902473-ee7c-4ef1-a7f2-83159b151f02.jpg',
  'https://www.imglink.io/i/5e61ce9a-d740-4542-88bf-6eba8636e1a8.jpg',
  'https://www.imglink.io/i/d046c98f-38d1-4dbb-8a48-abbd101a57fb.jpg',
  'https://www.imglink.io/i/a8b73531-93b9-47a9-b59d-18152ecbd715.jpg',
  'https://www.imglink.io/i/7306c2d2-8997-4308-86ad-0722d85b02aa.png',
  'https://www.imglink.io/i/ff46d561-e605-4285-86f4-6e1f26657618.png',
  'https://www.imglink.io/i/26215aec-dca1-4c79-81c1-3dcf1b17097d.png',
  'https://www.imglink.io/i/9b371dcf-d170-4c66-b41c-69c4785c75b3.png',
  'https://www.imglink.io/i/60fa33c4-92d7-4eed-a3d9-8cbf16accf50.png',
  'https://www.imglink.io/i/4bf524c5-42bd-4874-9635-d02f219f5698.png',
  'https://www.imglink.io/i/3afb5b89-5dea-4911-84e5-ae1061add954.png',
  'https://www.imglink.io/i/2e348982-7c01-4e4c-97b7-78ca9100c37c.png',
  'https://www.imglink.io/i/a94d053d-0778-4040-b563-a51f8f0b32fa.png',
  'https://www.imglink.io/i/57b297dc-2313-4d2e-a1cf-0c3dc687fae6.png'
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
  const carouselImages = teamImages?.length ? teamImages : defaultImages;
  const formattedTitle = splitTitle(title);
  const carouselRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const isAtStart = el.scrollLeft === 0;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2; // -2 for precision
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
    
    handleScroll(); // Check on initial render
    el.addEventListener('scroll', handleScroll);
    
    // Check again after images might have loaded
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

