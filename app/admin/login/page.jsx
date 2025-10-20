'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiClient, storeAuthToken } from '@/lib/apiClient';

const initialState = { email: '', password: '' };

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = window.localStorage.getItem('authToken');
    if (token) {
      router.replace('/admin');
    }
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    try {
      const response = await apiClient.post('/auth/login', credentials);

      if (!response?.token) {
        throw new Error('Resposta inesperada da API.');
      }

      if (!['admin', 'editor', 'admin_viewer'].includes(response?.role)) {
        throw new Error('Esta conta não possui permissões de administração.');
      }

      storeAuthToken(response.token);
      setFeedback({ type: 'success', message: 'Login realizado com sucesso. Redirecionando…' });
      router.replace('/admin');
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível autenticar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900/60 p-10 rounded-3xl shadow-xl shadow-red-500/20 space-y-6">
        <div className="text-center space-y-2">
          <img
            src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png"
            alt="Logo TRAMA"
            className="w-60 mx-auto"
          />
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Painel administrativo</p>
          <h1 className="text-3xl font-serif">Área restrita</h1>
          <p className="text-sm text-gray-400">
            Utilize as credenciais fornecidas pela equipa de gestão para aceder às ferramentas avançadas do TRAMA.
          </p>
        </div>

        {feedback.type !== 'idle' && (
          <div
            className={`text-sm text-center px-4 py-3 rounded-xl border ${
              feedback.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-green-500/40 bg-green-500/10 text-green-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email institucional
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="voce@trama.pt"
              className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Palavra-passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 transition-colors text-white font-semibold py-3 rounded-lg"
          >
            {isSubmitting ? 'A validar…' : 'Entrar no painel'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Precisa de ajuda? Contacte a equipa técnica ou utilize a{' '}
          <Link href="/acesso" className="text-red-400 hover:text-red-300 font-medium">
            área de acesso para utilizadores
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

