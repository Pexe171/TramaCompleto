'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { apiClient, clearStoredToken, storeAuthToken } from '@/lib/apiClient';

const initialLoginState = { email: '', password: '' };
const initialRegisterState = { displayName: '', username: '', email: '', password: '' };

export default function AcessoPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });
  const [loginValues, setLoginValues] = useState(initialLoginState);
  const [registerValues, setRegisterValues] = useState(initialRegisterState);

  useEffect(() => {
    setFeedback({ type: 'idle', message: '' });
  }, [isLogin]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    try {
      const data = await apiClient.post('/auth/login', loginValues);
      if (data?.token) {
        storeAuthToken(data.token);
      }

      const successMessage = data?.message || 'Login realizado com sucesso! A redirecionar...';
      setFeedback({ type: 'success', message: successMessage });

      if (data?.role === 'admin' || data?.role === 'editor') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    try {
      const payload = {
        ...registerValues,
        displayName: registerValues.displayName || registerValues.username,
      };
      const data = await apiClient.post('/auth/register', payload);
      if (data?.token) {
        storeAuthToken(data.token);
      }

      setFeedback({
        type: 'success',
        message: data?.message || 'Conta criada com sucesso! Pode iniciar sessão.',
      });
      setRegisterValues(initialRegisterState);
      setIsLogin(true);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const infoMessage = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const hasToken = window.localStorage.getItem('authToken');
      if (hasToken) {
        return 'Já existe uma sessão activa. Utilize o botão de sair no painel para terminar.';
      }
    } catch (_error) {
      clearStoredToken();
    }

    return null;
  }, []);

  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 p-8 rounded-2xl shadow-lg shadow-red-500/10">
        <div className="text-center mb-6">
          <img
            src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png"
            alt="Logo TRAMA"
            className="w-72 mx-auto"
          />
        </div>

        <h2 className="text-center text-3xl font-serif mb-6">
          {isLogin ? 'Login' : 'Registo'}
        </h2>

        {feedback.type !== 'idle' && (
          <div
            className={`mb-6 text-sm p-3 rounded-lg text-center ${
              feedback.type === 'error'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-green-500/10 text-green-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {infoMessage && feedback.type === 'idle' && (
          <div className="mb-6 text-xs text-yellow-300/80 bg-yellow-500/10 p-3 rounded-lg text-center">
            {infoMessage}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginValues.email}
                onChange={handleInputChange(setLoginValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Palavra-passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginValues.password}
                onChange={handleInputChange(setLoginValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
            >
              {isSubmitting ? 'A verificar...' : 'Aceder'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
                Nome completo
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={registerValues.displayName}
                onChange={handleInputChange(setRegisterValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="O seu nome"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Nome de utilizador
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={registerValues.username}
                onChange={handleInputChange(setRegisterValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="trama_fan"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={registerValues.email}
                onChange={handleInputChange(setRegisterValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Palavra-passe
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={registerValues.password}
                onChange={handleInputChange(setRegisterValues)}
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Crie uma palavra-passe forte"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres.</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
            >
              {isSubmitting ? 'A criar conta...' : 'Criar Conta'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-red-500 hover:text-red-400 ml-2 focus:outline-none"
            type="button"
          >
            {isLogin ? 'Registe-se' : 'Faça login'}
          </button>
        </p>
      </div>

      <Link href="/" className="text-gray-500 hover:text-white transition-colors mt-8 text-sm">
        ← Voltar para o início
      </Link>
    </main>
  );
}
