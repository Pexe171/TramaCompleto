'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClient, resolveAssetUrl } from '../../../../lib/apiClient';

const initialFormState = {
  title: '',
  description: '',
  priority: '0',
  isActive: true,
  coverImageFile: null,
  coverImageUrl: '',
};

const formatEditorias = (items) =>
  (Array.isArray(items) ? items : [])
    .slice()
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || new Date(b.createdAt) - new Date(a.createdAt));

export default function AdminEditoriasPage() {
  const [editorias, setEditorias] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState('');
  const [objectUrl, setObjectUrl] = useState(null);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadEditorias = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.get('/admin/editorias', { signal: controller.signal });
        setEditorias(data || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadEditorias();
    return () => controller.abort();
  }, []);

  useEffect(() => () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }, [objectUrl]);

  const orderedEditorias = useMemo(() => formatEditorias(editorias), [editorias]);

  const resetForm = () => {
    setFormState(initialFormState);
    setPreviewUrl('');
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCoverFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setPreviewUrl(nextUrl);
    setFormState((prev) => ({ ...prev, coverImageFile: file, coverImageUrl: '' }));
  };

  const handleCoverUrlChange = (event) => {
    const value = event.target.value;
    setPreviewUrl(value);
    setFormState((prev) => ({ ...prev, coverImageUrl: value, coverImageFile: null }));
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    const payload = new FormData();
    payload.append('title', formState.title);
    payload.append('description', formState.description);
    payload.append('priority', formState.priority);
    payload.append('isActive', formState.isActive);
    if (formState.coverImageFile) {
      payload.append('coverImage', formState.coverImageFile);
    }
    if (formState.coverImageUrl) {
      payload.append('coverImageUrl', formState.coverImageUrl);
    }

    try {
      const created = await apiClient.post('/admin/editorias', payload);
      setEditorias((prev) => [created, ...prev]);
      setFeedback({ type: 'success', message: 'Editoria criada com sucesso!' });
      resetForm();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Não foi possível criar a editoria.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverPreview = previewUrl || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png';

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Admin &bull; Editorias</p>
        <h1 className="text-4xl font-serif font-bold">Criar e gerir editorias</h1>
        <p className="text-gray-400 max-w-3xl">
          Defina as editorias que organizam os conteúdos do TRAMA. Utilize a mesma paleta dos outros painéis e mantenha a
          consistência visual, escolhendo uma imagem de capa a partir do seu dispositivo ou através de um URL já hospedado.
        </p>
      </header>

      <section className="bg-gray-900/50 rounded-2xl p-8 space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-serif font-semibold">Nova editoria</h2>
          <p className="text-sm text-gray-400">
            Carregue uma imagem local ou indique o endereço remoto. A pré-visualização abaixo actualiza automaticamente para ajudar a
            escolher a melhor composição. Use ficheiros otimizados e links seguros (https) para garantir desempenho.
          </p>
          {feedback.type !== 'idle' && (
            <div
              className={`text-sm px-4 py-3 rounded-xl border ${
                feedback.type === 'error'
                  ? 'border-red-500/40 bg-red-500/10 text-red-300'
                  : 'border-green-500/40 bg-green-500/10 text-green-300'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Título da editoria
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                placeholder="Cinema, Música, Cultura Urbana..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                placeholder="Explique a linha editorial, público-alvo e tom desta secção."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                  Prioridade de exibição
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formState.priority}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Quanto menor o número, mais destaque na listagem.</p>
              </div>

              <div className="flex items-center space-x-3 mt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Editoria visível para o público
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
                  Upload de imagem
                </label>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/30"
                />
                <p className="text-xs text-gray-500 mt-1">Ideal para imagens novas, produzidas internamente.</p>
              </div>

              <div>
                <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  URL hospedado (https)
                </label>
                <input
                  type="url"
                  id="coverImageUrl"
                  name="coverImageUrl"
                  value={formState.coverImageUrl}
                  onChange={handleCoverUrlChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use quando a imagem já está optimizada num serviço externo. Esta opção poupa armazenamento local.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm text-gray-400">
              Pré-visualização instantânea para confirmar cortes, foco e paleta. Utilize o modo escuro como referência para garantir
              contraste adequado do texto.
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950/60">
              <img src={coverPreview} alt="Pré-visualização da capa" className="w-full h-56 object-cover" />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg"
            >
              {isSubmitting ? 'A guardar…' : 'Criar editoria'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-semibold">Editorias registadas</h2>
            <p className="text-sm text-gray-400">
              Faça revisões periódicas, garantindo descrições actualizadas e imagens coerentes com o momento editorial.
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500">{orderedEditorias.length} editorias</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? [...Array(3)].map((_, index) => <div key={index} className="h-48 bg-gray-900/40 rounded-xl animate-pulse" />)
            : orderedEditorias.map((editoria) => {
                const coverImage = resolveAssetUrl(editoria.coverImage);
                return (
                  <article key={editoria._id} className="bg-gray-900/40 rounded-xl overflow-hidden border border-gray-800/60">
                    <div className="relative h-40">
                      <img
                        src={coverImage || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png'}
                        alt={`Capa da editoria ${editoria.title}`}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${
                          editoria.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {editoria.isActive ? 'Ativa' : 'Oculta'}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold text-white">{editoria.title}</h3>
                      {editoria.description && <p className="text-sm text-gray-400 line-clamp-3">{editoria.description}</p>}
                      <dl className="flex items-center justify-between text-xs text-gray-500">
                        <div>
                          <dt className="uppercase tracking-widest">Prioridade</dt>
                          <dd className="font-semibold text-gray-300">{editoria.priority ?? 0}</dd>
                        </div>
                        <div className="text-right">
                          <dt className="uppercase tracking-widest">Actualizada</dt>
                          <dd>{new Date(editoria.updatedAt || editoria.createdAt).toLocaleDateString('pt-BR')}</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
              })}
        </div>

        {!isLoading && !orderedEditorias.length && (
          <div className="bg-gray-900/40 border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400">
            Ainda não existem editorias registadas. Preencha o formulário acima para criar a primeira secção editorial.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}
