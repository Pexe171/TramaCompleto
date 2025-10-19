'use client';

import { useState, useEffect } from 'react';

// --- Lógica do Cliente de API (integrada para compatibilidade) ---
const API_URL = 'http://localhost:5000/api';
async function fetcher(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const defaultOptions = {
    headers: {
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };
  try {
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na API.');
    }
    return response.status !== 204 ? await response.json() : null; // Handle no content response
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

const apiClient = {
  get: (endpoint) => fetcher(endpoint),
  post: (endpoint, body) => fetcher(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body) => fetcher(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint) => fetcher(endpoint, { method: 'DELETE' }),
};

// --- COMPONENTES DA UI ---

const StatCard = ({ title, value, icon, isLoading }) => (
  <div className="bg-gray-900/50 p-6 rounded-xl">
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      </div>
    ) : (
      <div className="flex items-center space-x-4">
        <div className="bg-red-500/20 p-3 rounded-lg">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
          </svg>
        </div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    )}
  </div>
);

const PostRow = ({ post, onDelete }) => {
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR');
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="py-4 px-6 font-medium">{post.title}</td>
      <td className="py-4 px-6 text-gray-400">{post.editoriaId?.title || 'Sem Categoria'}</td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
          post.status === 'publicado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {post.status}
        </span>
      </td>
      <td className="py-4 px-6 text-gray-400">{formattedDate}</td>
      <td className="py-4 px-6 text-right">
        <a href={`/admin/posts/${post._id}`} className="text-blue-400 hover:text-blue-300 mr-4 font-semibold">Editar</a>
        <button onClick={() => onDelete(post._id, post.title)} className="text-red-500 hover:text-red-400 font-semibold">Excluir</button>
      </td>
    </tr>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 max-w-sm w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold">Confirmar Exclusão</button>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, postId: null, postTitle: '' });

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const articles = await apiClient.get('/admin/articles');
        setPosts(articles);
      } catch (err) {
         // Se o erro for de autenticação, o layout já deve ter redirecionado
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // A verificação de autenticação agora está no layout, então apenas chamamos os dados
    fetchPosts();
  }, []);

  const openDeleteModal = (postId, postTitle) => {
    setModalState({ isOpen: true, postId, postTitle });
  };

  const closeDeleteModal = () => {
    setModalState({ isOpen: false, postId: null, postTitle: '' });
  };

  const handleDelete = async () => {
    if (!modalState.postId) return;
    try {
      await apiClient.delete(`/admin/articles/${modalState.postId}`);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== modalState.postId));
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
    }
  };
  
  const stats = {
      posts: posts.length,
      views: posts.reduce((sum, post) => sum + (post.stats?.views || 0), 0),
      comments: posts.reduce((sum, post) => sum + (post.stats?.commentsCount || 0), 0)
  };

  if (error && !posts.length) {
    return (
      <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Não foi possível carregar o painel</h2>
        <p>{error}</p>
        <p className="text-sm mt-2 text-gray-400">Verifique se o servidor backend está a ser executado e se está autenticado.</p>
      </div>
    );
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem a certeza que deseja excluir permanentemente o artigo "${modalState.postTitle}"? Esta ação não pode ser desfeita.`}
      />
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold">Bem-vinda, Helena!</h1>
          <p className="text-gray-400 mt-1">Aqui está um resumo da sua atividade.</p>
        </div>
        <a href="/admin/posts/new" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
           <span>Criar Novo Post</span>
        </a>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <StatCard title="Total de Posts" value={stats.posts} icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" isLoading={isLoading} />
        <StatCard title="Visualizações Totais" value={stats.views} icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zM21 12c-1.5 4.5-6 7.5-9 7.5s-7.5-3-9-7.5 3-7.5 9-7.5 7.5 3 9 7.5z" isLoading={isLoading} />
        <StatCard title="Comentários" value={stats.comments} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" isLoading={isLoading} />
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold mb-6">Posts Recentes</h2>
        <div className="bg-gray-900/50 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/30">
              <tr>
                <th className="py-3 px-6 uppercase text-sm text-gray-400 font-semibold tracking-wider">Título</th>
                <th className="py-3 px-6 uppercase text-sm text-gray-400 font-semibold tracking-wider">Editoria</th>
                <th className="py-3 px-6 uppercase text-sm text-gray-400 font-semibold tracking-wider">Status</th>
                <th className="py-3 px-6 uppercase text-sm text-gray-400 font-semibold tracking-wider">Data</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800 animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                    <td className="py-4 px-6"></td>
                  </tr>
                ))
              ) : (
                posts.slice(0, 4).map(post => <PostRow key={post._id} post={post} onDelete={openDeleteModal} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

