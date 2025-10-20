'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClient, resolveAssetUrl } from '@/lib/apiClient';

import { useAdminSession } from '../AdminSessionContext';

const initialFormState = {
  title: '',
  description: '',
  priority: '0',
  isActive: true,
  coverImageFile: null,
  coverImageUrl: '',
  coverImageFocusX: 50,
  coverImageFocusY: 50,
  coverImageScale: 100,
  descriptionImageFile: null,
  descriptionImageUrl: '',
};

const formatEditorias = (items) =>
  (Array.isArray(items) ? items : [])
    .slice()
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || new Date(b.createdAt) - new Date(a.createdAt));

export default function AdminEditoriasPage() {
  const session = useAdminSession();
  const { status, permissions } = session;
  const canManageContent = !!permissions?.canManageContent;
  const isReadOnly = status === 'ready' && !canManageContent;

  const [editorias, setEditorias] = useState([]);
  const [formState, setFormState] = useState(initialFormState);
  const [previewUrl, setPreviewUrl] = useState('');
  const [objectUrl, setObjectUrl] = useState(null);
  const [descriptionPreviewUrl, setDescriptionPreviewUrl] = useState('');
  const [descriptionObjectUrl, setDescriptionObjectUrl] = useState(null);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status !== 'ready') {
      return undefined;
    }

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
  }, [status]);

  useEffect(() => () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }, [objectUrl]);

  useEffect(
    () => () => {
      if (descriptionObjectUrl) {
        URL.revokeObjectURL(descriptionObjectUrl);
      }
    },
    [descriptionObjectUrl],
  );

  const orderedEditorias = useMemo(() => formatEditorias(editorias), [editorias]);

  const resetForm = () => {
    setFormState(initialFormState);
    setPreviewUrl('');
    setDescriptionPreviewUrl('');
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    if (descriptionObjectUrl) {
      URL.revokeObjectURL(descriptionObjectUrl);
      setDescriptionObjectUrl(null);
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

  const handleDescriptionFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (descriptionObjectUrl) {
      URL.revokeObjectURL(descriptionObjectUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setDescriptionObjectUrl(nextUrl);
    setDescriptionPreviewUrl(nextUrl);
    setFormState((prev) => ({ ...prev, descriptionImageFile: file, descriptionImageUrl: '' }));
  };

  const handleDescriptionUrlChange = (event) => {
    const value = event.target.value;
    setDescriptionPreviewUrl(value);
    setFormState((prev) => ({ ...prev, descriptionImageUrl: value, descriptionImageFile: null }));
    if (descriptionObjectUrl) {
      URL.revokeObjectURL(descriptionObjectUrl);
      setDescriptionObjectUrl(null);
    }
  };

  const handleCoverControlChange = (name) => (event) => {
    const numericValue = Number(event.target.value);
    setFormState((prev) => ({ ...prev, [name]: Number.isFinite(numericValue) ? numericValue : prev[name] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManageContent) {
      setFeedback({ type: 'error', message: 'Esta conta está em modo de visualização. Apenas o administrador principal pode criar editorias.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    const payload = new FormData();
    payload.append('title', formState.title);
    payload.append('description', formState.description);
    payload.append('priority', formState.priority);
    payload.append('isActive', formState.isActive);
    payload.append('coverImageFocusX', String(formState.coverImageFocusX));
    payload.append('coverImageFocusY', String(formState.coverImageFocusY));
    payload.append('coverImageScale', String(formState.coverImageScale));
    if (formState.coverImageFile) {
      payload.append('coverImage', formState.coverImageFile);
    }
    if (formState.coverImageUrl) {
      payload.append('coverImageUrl', formState.coverImageUrl);
    }
    if (formState.descriptionImageFile) {
      payload.append('descriptionImage', formState.descriptionImageFile);
    }
    if (formState.descriptionImageUrl) {
      payload.append('descriptionImageUrl', formState.descriptionImageUrl);
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
  const coverPreviewStyles = {
    backgroundImage: `url(${coverPreview})`,
    backgroundPosition: `${formState.coverImageFocusX}% ${formState.coverImageFocusY}%`,
    backgroundSize: `${formState.coverImageScale}%`,
    backgroundRepeat: 'no-repeat',
  };
  const descriptionPreview = descriptionPreviewUrl || 'https://i.postimg.cc/WzXjG9mJ/ID-VISUAL-TRAMA-7.png';

  if (status !== 'ready') {
    return <p className="text-center text-gray-400">A validar permissões…</p>;
  }

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Admin &bull; Editorias</p>
        <h1 className="text-4xl font-serif font-bold">Criar e gerir editorias</h1>
        <p className="text-gray-400 max-w-3xl">
          Defina as editorias que organizam os conteúdos do TRAMA. Utilize a mesma paleta dos outros painéis e mantenha a
          coerência visual do portal.
        </p>
      </header>

      {isReadOnly && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 px-4 py-3 rounded-lg">
          Esta conta está em modo de visualização. Alterações nas editorias são bloqueadas automaticamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {feedback.type !== 'idle' && (
          <div
            className={`text-sm px-4 py-3 rounded-lg border ${
              feedback.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-green-500/40 bg-green-500/10 text-green-300'
            }`}
          >
            {feedback.message}
          </div>
        )}
        <fieldset
          disabled={isReadOnly}
          className={`space-y-8 ${isReadOnly ? 'opacity-70' : ''}`}
        >
          <section className="bg-gray-900/50 rounded-2xl p-8 space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-semibold">Nova editoria</h2>
              <p className="text-sm text-gray-400">
                Carregue uma imagem local ou indique o endereço remoto. A pré-visualização abaixo actualiza automaticamente para
                ajudar a escolher a melhor composição. Use ficheiros optimizados e ligações seguras.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                    className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Cinema, Música, Cultura Urbana..."
                    required
                  />
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
                      className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-300">
                      Editoria visível para o público
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
                      Upload da capa
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
                      URL da capa (https)
                    </label>
                    <input
                      type="url"
                      id="coverImageUrl"
                      name="coverImageUrl"
                      value={formState.coverImageUrl}
                      onChange={handleCoverUrlChange}
                      placeholder="https://exemplo.com/capa.jpg"
                      className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use quando a imagem já está optimizada num serviço externo. Esta opção poupa armazenamento local.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Descrição por imagem</h3>
                  <p className="text-xs text-gray-500">
                    Esta imagem comunica o propósito da editoria no portal público. Escolha elementos visuais que traduzam o tom do
                    conteúdo.
                  </p>
                  <div>
                    <label htmlFor="descriptionImage" className="block text-sm font-medium text-gray-300 mb-2">
                      Upload da descrição visual
                    </label>
                    <input
                      type="file"
                      id="descriptionImage"
                      name="descriptionImage"
                      accept="image/*"
                      onChange={handleDescriptionFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/30"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formatos quadrados ou verticais costumam funcionar melhor para este destaque.</p>
                  </div>

                  <div>
                    <label htmlFor="descriptionImageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                      URL da descrição visual (https)
                    </label>
                    <input
                      type="url"
                      id="descriptionImageUrl"
                      name="descriptionImageUrl"
                      value={formState.descriptionImageUrl}
                      onChange={handleDescriptionUrlChange}
                      placeholder="https://exemplo.com/descricao.jpg"
                      className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Prefira serviços que mantenham a imagem nítida mesmo em dispositivos móveis.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <p className="text-sm text-gray-400">
                  Ajuste a composição antes de publicar. As alterações de foco e zoom são guardadas junto com a editoria e refletem no
                  site público.
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950/60">
                    <div className="w-full h-56 bg-center bg-no-repeat transition-all duration-200" style={coverPreviewStyles} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Posição horizontal</span>
                        <span>{formState.coverImageFocusX}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formState.coverImageFocusX}
                        onChange={handleCoverControlChange('coverImageFocusX')}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Posição vertical</span>
                        <span>{formState.coverImageFocusY}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formState.coverImageFocusY}
                        onChange={handleCoverControlChange('coverImageFocusY')}
                        className="w-full accent-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Zoom</span>
                        <span>{formState.coverImageScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="200"
                        step="1"
                        value={formState.coverImageScale}
                        onChange={handleCoverControlChange('coverImageScale')}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Descrição visual</p>
                  <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950/60 flex items-center justify-center h-56">
                    {descriptionPreview ? (
                      <img
                        src={descriptionPreview}
                        alt="Pré-visualização da descrição por imagem"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">Sem imagem definida</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'A guardar…' : 'Criar editoria'}
                </button>
              </div>
            </div>
          </section>
        </fieldset>
      </form>

      <section className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold">Editorias registadas</h2>
            <p className="text-gray-400 text-sm">Visualize todas as editorias e confirme as informações que estão públicas no portal.</p>
          </div>
        </header>

        {error && !editorias.length ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">{error}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orderedEditorias.length > 0 ? (
              orderedEditorias.map((editoria) => (
                <article key={editoria._id} className="bg-gray-900/40 border border-gray-800/60 rounded-xl overflow-hidden">
                  <div className="relative h-36">
                    <img
                      src={resolveAssetUrl(editoria.coverImage) || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png'}
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
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Prioridade {editoria.priority ?? 0}</span>
                      <time dateTime={editoria.createdAt}>{new Date(editoria.createdAt).toLocaleDateString('pt-BR')}</time>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{editoria.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-3">{editoria.description || 'Sem descrição detalhada.'}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full bg-gray-900/40 border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400">
                Ainda não existem editorias registadas.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
