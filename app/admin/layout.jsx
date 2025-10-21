'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminSessionContext, getDefaultAdminSession } from './AdminSessionContext';
import { apiClient, clearStoredToken } from '@/lib/apiClient';

const Icon = ({ path }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
  { href: '/admin/editorias', label: 'Editorias', icon: 'M3 7h18M3 12h18M3 17h18' },
  { href: '/admin/posts/new', label: 'Novo Post', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [session, setSession] = useState(getDefaultAdminSession());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isLoginRoute) {
      setIsCheckingAuth(false);
      setIsLoadingSession(false);
      setAuthError(null);
      setSession(getDefaultAdminSession());
      return;
    }

    const hasToken = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;

    if (!hasToken) {
      setAuthError('Sessão expirada. Faça login novamente.');
      setSession(getDefaultAdminSession());
      setIsCheckingAuth(false);
      setIsLoadingSession(false);
      router.replace('/admin/login');
      return;
    }
    const fetchSession = async () => {
      setIsCheckingAuth(true);
      setIsLoadingSession(true);
      try {
        const data = await apiClient.get('/admin/profile');
        setSession({
          status: 'ready',
          user: data.user,
          permissions: data.permissions,
          primaryAdminEmail: data.primaryAdminEmail || null,
        });
        setAuthError(null);
      } catch (error) {
        setAuthError(error.message || 'Sessão expirada. Faça login novamente.');
        setSession(getDefaultAdminSession());
        clearStoredToken();
        router.replace('/admin/login');
      } finally {
        setIsCheckingAuth(false);
        setIsLoadingSession(false);
      }
    };

    fetchSession();
  }, [isLoginRoute, router]);

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (_error) {
      // O logout via cookie pode falhar em ambiente de desenvolvimento, mas mesmo assim
      // vamos limpar o token local para evitar inconsistências.
    } finally {
      clearStoredToken();
      setSession(getDefaultAdminSession());
      router.push('/admin/login');
    }
  }, [router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((previous) => !previous);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (isCheckingAuth || isLoadingSession) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <p className="text-sm text-gray-400">A validar as suas credenciais...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center">
        <div className="bg-gray-900/60 p-8 rounded-xl text-center space-y-4">
          <p className="text-red-400 font-semibold">{authError}</p>
          <button
            type="button"
            onClick={() => router.replace('/admin/login')}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            Ir para a página de acesso
          </button>
        </div>
      </div>
    );
  }

  const filteredNavLinks = navLinks.filter((item) => {
    if (item.href === '/admin/posts/new') {
      return session.permissions?.canManageContent || session.permissions?.isReadOnly;
    }
    return true;
  });

  return (
    <AdminSessionContext.Provider value={session}>
      <div className="min-h-screen bg-black text-gray-200 flex flex-col md:flex-row">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-black/90 border-b border-gray-800 px-5 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png"
              alt="Logo TRAMA"
              className="w-24"
            />
            <span className="text-xs uppercase tracking-[0.35em] text-gray-400">Painel Admin</span>
          </Link>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
            aria-label="Alternar navegação"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </header>

        {isMobileMenuOpen ? (
          <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={closeMobileMenu} aria-hidden="true"></div>
        ) : null}

        <aside
          className={`bg-gray-900/50 p-6 flex flex-col justify-between fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-50 md:static md:translate-x-0 md:h-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div>
            <div className="mb-10">
              <Link href="/">
                <img
                  src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png"
                  alt="Logo TRAMA"
                  className="w-40 mx-auto"
                />
              </Link>
              <p className="text-center text-xs text-gray-500 mt-2 uppercase tracking-widest">Painel Admin</p>
            </div>

            <nav className="flex flex-col space-y-3">
              {filteredNavLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 text-lg py-2 px-4 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-500/20 text-red-400 font-semibold'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon path={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 text-lg py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-500 hover:text-red-400"
            >
              <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 w-full md:ml-64 px-5 py-6 md:px-12 md:py-12">{children}</main>
      </div>
    </AdminSessionContext.Provider>
  );
}
