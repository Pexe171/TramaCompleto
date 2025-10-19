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
    return response.status !== 204 ? await response.json() : null;
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


// --- COMPONENTE PRINCIPAL DA PÁGINA DE FORMULÁRIO ---
export default function PostFormPage() {
    const [postId, setPostId] = useState(null);
    const [isNew, setIsNew] = useState(false);
    
    // Estado do formulário
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        editoriaId: '',
        status: 'rascunho',
        tags: '',
        coverImage: null
    });
    const [editorias, setEditorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Simula a obtenção do ID da URL
        const pathSegments = window.location.pathname.split('/');
        const id = pathSegments[pathSegments.length - 1];
        setPostId(id);
        const isNewPost = id === 'new';
        setIsNew(isNewPost);

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const editoriasData = await apiClient.get('/admin/editorias');
                setEditorias(editoriasData);

                if (!isNewPost) {
                    // Se for para editar, busca todos os posts e encontra o correto
                    const allPosts = await apiClient.get('/admin/articles');
                    const postToEdit = allPosts.find(p => p._id === id);
                    if (postToEdit) {
                        setFormData({
                            title: postToEdit.title || '',
                            summary: postToEdit.summary || '',
                            content: postToEdit.content || '',
                            editoriaId: postToEdit.editoriaId?._id || '',
                            status: postToEdit.status || 'rascunho',
                            tags: (postToEdit.tags || []).join(', '),
                            coverImage: null, // A imagem não é pré-carregada, o utilizador pode enviar uma nova
                        });
                    } else {
                        throw new Error('Artigo não encontrado.');
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (isNew) {
                await apiClient.post('/admin/articles', data);
            } else {
                await apiClient.put(`/admin/articles/${postId}`, data);
            }
            window.location.href = '/admin'; // Redireciona para o painel
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p className="text-center">A carregar editor...</p>;
    if (error && !isSubmitting) return <p className="text-center text-red-400">Erro: {error}</p>;

    return (
        <div>
            <header className="mb-12">
                <h1 className="text-4xl font-serif font-bold">{isNew ? 'Criar Novo Post' : 'Editar Post'}</h1>
                <p className="text-gray-400 mt-1">{isNew ? 'Preencha os detalhes abaixo para publicar um novo artigo.' : 'Atualize os detalhes do artigo.'}</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                 {error && (
                    <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md text-center">
                    {error}
                    </div>
                )}
                <div className="bg-gray-900/50 p-8 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Campo Título */}
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-md p-3" required />
                        </div>

                        {/* Campo Resumo */}
                        <div className="md:col-span-2">
                            <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">Resumo</label>
                            <textarea name="summary" id="summary" value={formData.summary} onChange={handleChange} rows="3" className="w-full bg-gray-800 border-gray-700 rounded-md p-3"></textarea>
                        </div>
                        
                        {/* Campo Conteúdo */}
                        <div className="md:col-span-2">
                            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Conteúdo (Markdown)</label>
                            <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows="15" className="w-full bg-gray-800 border-gray-700 rounded-md p-3 font-mono text-sm" required></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-8 rounded-xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Campo Editoria */}
                        <div>
                            <label htmlFor="editoriaId" className="block text-sm font-medium text-gray-300 mb-2">Editoria</label>
                            <select name="editoriaId" id="editoriaId" value={formData.editoriaId} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-md p-3">
                                <option value="">Sem Categoria</option>
                                {editorias.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                            </select>
                        </div>
                        {/* Campo Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-md p-3">
                                <option value="rascunho">Rascunho</option>
                                <option value="publicado">Publicado</option>
                            </select>
                        </div>
                         {/* Campo Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                            <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} placeholder="cinema, critica, ufam" className="w-full bg-gray-800 border-gray-700 rounded-md p-3" />
                             <p className="text-xs text-gray-500 mt-1">Separadas por vírgulas.</p>
                        </div>

                        {/* Campo Imagem de Capa */}
                        <div>
                            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">Imagem de Capa</label>
                            <input type="file" name="coverImage" id="coverImage" onChange={handleChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/30" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                     <a href="/admin" className="px-6 py-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">Cancelar</a>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold disabled:bg-red-800 disabled:cursor-not-allowed">
                        {isSubmitting ? 'A guardar...' : (isNew ? 'Publicar Post' : 'Guardar Alterações')}
                    </button>
                </div>
            </form>
        </div>
    );
}
