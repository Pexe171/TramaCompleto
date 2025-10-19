'use client';

import { useState } from 'react';
// A importação do Link foi removida para compatibilidade com o preview.
// Em um projeto real, a importação `import Link from 'next/link';` estaria correta.

export default function AcessoPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 p-8 rounded-2xl shadow-lg shadow-red-500/10">
        
        {/* Logo Trama */}
        <div className="text-center mb-6">
            <img 
                src="https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png" 
                alt="Logo TRAMA"
                className="w-72 mx-auto"
            />
        </div>

        {/* Título dinâmico */}
        <h2 className="text-center text-3xl font-serif mb-6">
          {isLogin ? 'Login' : 'Registo'}
        </h2>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <p className="text-center text-sm text-gray-400 mt-6">
          {isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-red-500 hover:text-red-400 ml-2 focus:outline-none"
          >
            {isLogin ? 'Registe-se' : 'Faça login'}
          </button>
        </p>
      </div>
      {/* O componente Link foi substituído por uma tag <a> */}
      <a href="/" className="text-gray-500 hover:text-white transition-colors mt-8 text-sm">
          ← Voltar para o início
      </a>
    </main>
  );
}

// Componente do Formulário de Login
const LoginForm = () => (
  <form className="space-y-6">
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
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
        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
        placeholder="********"
        required
      />
    </div>
    <button
      type="submit"
      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
    >
      Aceder
    </button>
  </form>
);

// Componente do Formulário de Registo
const RegisterForm = () => (
  <form className="space-y-6">
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
        Nome
      </label>
      <input
        type="text"
        id="name"
        name="name"
        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
        placeholder="Seu Nome Completo"
        required
      />
    </div>
    <div>
      <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300">
        Email
      </label>
      <input
        type="email"
        id="reg-email"
        name="email"
        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
        placeholder="seu@email.com"
        required
      />
    </div>
    <div>
      <label
        htmlFor="reg-password"
        className="block text-sm font-medium text-gray-300"
      >
        Palavra-passe
      </label>
      <input
        type="password"
        id="reg-password"
        name="password"
        className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500"
        placeholder="Crie uma palavra-passe forte"
        required
      />
    </div>
    <button
      type="submit"
      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
    >
      Criar Conta
    </button>
  </form>
);

