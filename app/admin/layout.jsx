// Este layout define a estrutura visual do painel de administração,
// com uma barra lateral de navegação e uma área principal para o conteúdo.

// Importação do Link para navegação. Em um ambiente real, seria 'next/link'.
// Para o preview, vamos usar a tag <a>.
// import Link from 'next/link'; 

// Componente de ícone para a barra lateral
const Icon = ({ path }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex">
      {/* Barra Lateral de Navegação */}
      <aside className="w-64 bg-gray-900/50 p-6 flex flex-col justify-between fixed h-full">
        <div>
          {/* Logo */}
          <div className="mb-10">
            <a href="/">
              <img 
                src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png" 
                alt="Logo TRAMA"
                className="w-40 mx-auto"
              />
            </a>
            <p className="text-center text-xs text-gray-500 mt-2 uppercase tracking-widest">Painel Admin</p>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex flex-col space-y-3">
            <a href="#" className="flex items-center space-x-3 text-lg py-2 px-4 rounded-lg bg-red-500/20 text-red-400 font-semibold">
              <Icon path="M4 6h16M4 12h16M4 18h16" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-lg py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Icon path="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              <span>Posts</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-lg py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Icon path="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              <span>Criar Novo</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-lg py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors">
              <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              <span>Perfil</span>
            </a>
          </nav>
        </div>

        {/* Botão de Sair */}
        <div>
           <a href="/acesso" className="flex items-center space-x-3 text-lg py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-500 hover:text-red-400">
             <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            <span>Sair</span>
          </a>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}
