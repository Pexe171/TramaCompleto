'use client';

import { useEffect, useState } from 'react';

import { apiClient, resolveAssetUrl } from '@/lib/apiClient';

import { useAdminSession } from '../../AdminSessionContext';

const initialFormState = {
  title: '',
  summary: '',
  content: '',
  editoriaId: '',
  status: 'rascunho',
  tags: '',
  coverImageFile: null,
  coverImageUrl: '',
};

// --- COMPONENTE PRINCIPAL DA PÁGINA DE FORMULÁRIO ---
export default function PostFormPage() {
  const session = useAdminSession();
  const { status, permissions } = session;
  const canManageContent = !!permissions?.canManageContent;
  const [postId, setPostId] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const [formData, setFormData] = useState(initialFormState);
  const [editorias, setEditorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [objectUrl, setObjectUrl] = useState(null);
  const [existingCover, setExistingCover] = useState('');
  const [initialCover, setInitialCover] = useState('');

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    const pathSegments = window.location.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    setPostId(id);
    const isNewPost = id === 'new';
    setIsNew(isNewPost);

    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const editoriasData = await apiClient.get('/admin/editorias', { signal: controller.signal });
        setEditorias(editoriasData || []);

        if (!isNewPost) {
          const articles = await apiClient.get('/admin/articles', { signal: controller.signal });
          const postToEdit = (articles || []).find((article) => article._id === id);

          if (postToEdit) {
            const coverPath = postToEdit.coverImage || '';
            const resolvedPreview = resolveAssetUrl(coverPath) || coverPath;
            const isRemoteCover = /^https?:\/\//i.test(coverPath);

            setFormData({
              title: postToEdit.title || '',
              summary: postToEdit.summary || '',
              content: postToEdit.content || '',
              editoriaId: postToEdit.editoriaId?._id || '',
              status: postToEdit.status || 'rascunho',
              tags: (postToEdit.tags || []).join(', '),
              coverImageFile: null,
              coverImageUrl: isRemoteCover ? coverPath : '',
            });

            setExistingCover(coverPath);
            setInitialCover(coverPath);
            if (resolvedPreview) {
              setCoverPreview(resolvedPreview);
            }
          } else {
            throw new Error('Artigo não encontrado.');
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => controller.abort();
  }, [status]);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setCoverPreview(nextUrl);
    setExistingCover('');
    setFormData((prev) => ({ ...prev, coverImageFile: file, coverImageUrl: '' }));
  };

  const handleCoverUrlChange = (event) => {
    const value = event.target.value;
    setCoverPreview(value);
    if (value) {
      setExistingCover('');
    } else {
      setExistingCover(initialCover);
    }
    setFormData((prev) => ({ ...prev, coverImageUrl: value, coverImageFile: null }));
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManageContent) {
      setError('Esta conta não possui permissão para guardar alterações.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('summary', formData.summary);
    data.append('content', formData.content);
    data.append('editoriaId', formData.editoriaId);
    data.append('status', formData.status);
    data.append('tags', formData.tags);

    if (formData.coverImageFile) {
      data.append('coverImage', formData.coverImageFile);
    }
    if (formData.coverImageUrl) {
      data.append('coverImageUrl', formData.coverImageUrl);
    }

    try {
      if (isNew) {
        await apiClient.post('/admin/articles', data);
      } else {
        await apiClient.put(`/admin/articles/${postId}`, data);
      }
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status !== 'ready') {
    return <p className="text-center text-gray-400">A validar permissões…</p>;
  }

  if (!canManageContent) {
    return (
      <section className="space-y-12">
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-xl p-8 text-center text-gray-300">
          <h1 className="text-3xl font-serif font-bold mb-3">Modo de visualização</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Esta conta foi configurada apenas para demonstrar o painel. Apenas o administrador principal pode criar ou editar
            posts.
          </p>
        </div>

        <div className="space-y-6">
          <header className="space-y-2 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-red-400">Demonstração interativa</p>
            <h2 className="text-3xl font-serif font-bold text-white">Como formatar links e vídeos no conteúdo</h2>
            <p className="text-sm text-gray-400">
              A secção abaixo replica exactamente como o leitor verá um artigo publicado, incluindo a incorporação automática de
              vídeos do YouTube.
            </p>
          </header>

          <article className="rounded-3xl border border-gray-800 bg-gray-950/60 p-8 space-y-6 shadow-lg shadow-black/30">
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-red-400">Exemplo prático</p>
              <h3 className="text-3xl font-serif font-bold text-white">Guia rápido para incorporar links e vídeos</h3>
              <p className="text-sm text-gray-400">
                Utilize este roteiro como referência ao redigir um novo post na plataforma.
              </p>
            </header>

            <p className="text-base leading-relaxed text-gray-200">
              Aqui começa o primeiro parágrafo do artigo. Você pode escrever sobre qualquer assunto, comentar uma entrevista ou
              apenas usar este texto como um marcador. <strong className="text-red-200">Lembre-se</strong> de que a formatação é
              importante para a legibilidade e que links simples são transformados automaticamente em elementos clicáveis.
            </p>

            <p className="text-base leading-relaxed text-gray-200">
              Este é o segundo parágrafo. Continue a desenvolver a ideia introduzida anteriormente, adicione citações, listas ou
              destaque palavras com o formato {'{{cor|texto}}'}, por exemplo <code>{'{{vermelho|urgente}}'}</code> ou
              {' '}<code>{'{{#FFD700|destaque}}'}</code>.
            </p>

            <div className="rounded-3xl border border-red-500/40 bg-black shadow-lg shadow-red-900/30 overflow-hidden">
              <div className="relative pt-[56.25%]">
                <iframe
                  src="https://www.youtube.com/embed/Qr0w4w9WgXQ"
                  title="Exemplo de vídeo incorporado do YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                ></iframe>
              </div>
            </div>

            <p className="text-base leading-relaxed text-gray-200">
              O vídeo acima foi incorporado automaticamente. Basta deixar uma linha em branco antes e outra depois do link do
              YouTube e o leitor construirá o player. Se desejar, inclua uma legenda com um{' '}
              <a
                href="https://www.youtube.com/watch?v=Qr0w4w9WgXQ"
                target="_blank"
                rel="noreferrer"
                className="text-red-300 underline decoration-dotted underline-offset-4 hover:text-red-200"
              >
                acesso directo ao vídeo
              </a>
              .
            </p>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-300 space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Boas práticas</h4>
              <ul className="list-disc space-y-2 pl-5 text-gray-400">
                <li>Separe os parágrafos com uma linha em branco para garantir a criação correcta dos blocos.</li>
                <li>Coloque o link completo do YouTube em uma linha isolada para gerar o iframe automaticamente.</li>
                <li>Use o padrão {'{{cor|texto}}'} para evidenciar palavras-chave sem recorrer a HTML manual.</li>
              </ul>
              <pre className="whitespace-pre-wrap rounded-md bg-gray-950/60 px-4 py-3 font-mono text-xs text-gray-300">
{`Texto anterior

https://youtu.be/Qr0w4w9WgXQ

Texto seguinte`}
              </pre>
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (isLoading) return <p className="text-center">A carregar editor...</p>;
  if (error && !isSubmitting) return <p className="text-center text-red-400">Erro: {error}</p>;

  const previewImage = coverPreview || (existingCover ? resolveAssetUrl(existingCover) : 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png');

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-bold">{isNew ? 'Criar Novo Post' : 'Editar Post'}</h1>
        <p className="text-gray-400 mt-1">
          {isNew
            ? 'Preencha os detalhes abaixo para publicar um novo artigo.'
            : 'Atualize os detalhes do artigo e confirme a imagem de destaque.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md text-center">{error}</div>
        )}
        <div className="bg-gray-900/50 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-300 mb-2">
                Resumo
              </label>
              <textarea
                name="summary"
                id="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Conteúdo do artigo
              </label>
              <textarea
                name="content"
                id="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="15"
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3 font-mono text-sm"
                required
              ></textarea>
              <div className="mt-2 space-y-2 text-xs text-gray-500">
                <p>
                  O editor entende parágrafos separados por uma linha em branco, links em formato comum ou Markdown e vídeos
                  do YouTube copiados como URL, link ou iframe.
                </p>
                <pre className="whitespace-pre-wrap rounded-md bg-gray-900/60 px-3 py-2 font-mono text-[11px] text-gray-300">
{`Parágrafo anterior

https://youtu.be/ID_DO_VIDEO

Próximo parágrafo`}
                </pre>
                <p>
                  Para destacar palavras, utilize o formato <code>{'{{cor|texto}}'}</code>, por exemplo{' '}
                  <code>{'{{vermelho|urgente}}'}</code> ou <code>{'{{#FFD700|destaque}}'}</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-8 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="editoriaId" className="block text-sm font-medium text-gray-300 mb-2">
                Editoria
              </label>
              <select
                name="editoriaId"
                id="editoriaId"
                value={formData.editoriaId}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
              >
                <option value="">Sem Categoria</option>
                {editorias.map((editoria) => (
                  <option key={editoria._id} value={editoria._id}>
                    {editoria.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
              >
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="cinema, critica, ufam"
                className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
              />
              <p className="text-xs text-gray-500 mt-1">Separadas por vírgulas.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">
                  Imagem de capa (upload)
                </label>
                <input
                  type="file"
                  name="coverImage"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600/20 file:text-red-300 hover:file:bg-red-600/30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ideal para fotografias inéditas captadas pela redacção.
                </p>
              </div>

              <div>
                <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  URL hospedado (https)
                </label>
                <input
                  type="url"
                  name="coverImageUrl"
                  id="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleCoverUrlChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full bg-gray-800 border-gray-700 rounded-md p-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilize quando a imagem já está optimizada num serviço externo, poupando espaço local.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-gray-950/40 border border-gray-800 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-3">
                Pré-visualização em tempo real. Garanta que o enquadramento funciona tanto no desktop quanto no mobile.
              </p>
              <div className="rounded-lg overflow-hidden border border-gray-800">
                <img src={previewImage} alt="Pré-visualização da capa" className="w-full h-64 object-cover" />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Dica: se alternar entre upload e URL, a última opção preenchida será utilizada. Deixe ambos vazios para manter a capa actual.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <a href="/admin" className="px-6 py-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
            Cancelar
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold disabled:bg-red-800 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'A guardar...' : isNew ? 'Publicar Post' : 'Guardar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
