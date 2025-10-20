'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClient, resolveAssetUrl } from '@/lib/apiClient';

import { useAdminSession } from './AdminSessionContext';

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

const PostRow = ({ post, onDelete, canManageContent }) => {
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('pt-BR');
  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/50">
      <td className="py-4 px-6 font-medium">{post.title}</td>
      <td className="py-4 px-6 text-gray-400">{post.editoriaId?.title || 'Sem Categoria'}</td>
      <td className="py-4 px-6">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
            post.status === 'publicado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          {post.status}
        </span>
      </td>
      <td className="py-4 px-6 text-gray-400">{formattedDate}</td>
      <td className="py-4 px-6 text-right">
        {canManageContent ? (
          <div className="flex items-center justify-end space-x-4">
            <a href={`/admin/posts/${post._id}`} className="text-blue-400 hover:text-blue-300 font-semibold">
              Editar
            </a>
            <button onClick={() => onDelete(post._id, post.title)} className="text-red-500 hover:text-red-400 font-semibold">
              Excluir
            </button>
          </div>
        ) : (
          <span className="text-gray-500 text-sm italic">Apenas visualização</span>
        )}
      </td>
    </tr>
  );
};

const EditoriaCard = ({ editoria }) => {
  const coverImage = resolveAssetUrl(editoria.coverImage) || 'https://i.postimg.cc/6pMB855R/ID-VISUAL-TRAMA-8-3.png';
  const descriptionImage = resolveAssetUrl(editoria.descriptionImage);
  const coverStyle = {
    backgroundImage: `url(${coverImage})`,
    backgroundPosition: `${editoria.coverImageFocusX ?? 50}% ${editoria.coverImageFocusY ?? 50}%`,
    backgroundSize: `${editoria.coverImageScale ?? 100}%`,
    backgroundRepeat: 'no-repeat',
  };
  return (
    <article className="bg-gray-900/40 rounded-xl overflow-hidden border border-gray-800/60">
      <div className="relative h-36 w-full overflow-hidden">
        <div className="absolute inset-0" style={coverStyle} />
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
        {descriptionImage ? (
          <div className="rounded-lg overflow-hidden border border-gray-800/60 bg-gray-950/40">
            <img
              src={descriptionImage}
              alt={`Descrição visual da editoria ${editoria.title}`}
              className="w-full h-28 object-contain bg-black/40"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sem descrição visual cadastrada.</p>
        )}
      </div>
    </article>
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
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors font-semibold">
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminViewerForm = ({ canManageUsers, primaryAdminEmail }) => {
  const initialState = { email: '', displayName: '', password: '' };
  const [formState, setFormState] = useState(initialState);
  const [feedback, setFeedback] = useState({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!canManageUsers) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: 'idle', message: '' });
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/admin/users/viewer', formState);
      setFeedback({
        type: 'success',
        message: response?.message || 'Administrador em modo visualização criado com sucesso.',
      });
      setFormState(initialState);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível criar o administrador convidado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-12 bg-gray-900/50 rounded-xl p-8 space-y-6 border border-gray-800/60">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold">Adicionar administrador convidado</h2>
        <p className="text-sm text-gray-400">
          Crie uma conta com acesso apenas de visualização para demonstrar o painel a outras pessoas sem qualquer risco de
          alteração de conteúdo.
        </p>
        <p className="text-xs text-gray-500">
          Apenas o administrador principal ({primaryAdminEmail || 'admin@trama.com'}) pode concluir esta operação.
        </p>
      </div>

      {feedback.type !== 'idle' && (
        <div
          className={`text-sm px-4 py-3 rounded-lg border ${
            feedback.type === 'error'
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-green-500/40 bg-green-500/10 text-green-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email institucional do convidado
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            required
            placeholder="convidado@trama.com"
            className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
            Nome a exibir no painel
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formState.displayName}
            onChange={handleChange}
            placeholder="Convidado VIP"
            className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Palavra-passe temporária
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formState.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="mínimo de 6 caracteres"
            className="w-full bg-gray-950/60 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-800 font-semibold transition-colors"
          >
            {isSubmitting ? 'A criar acesso seguro…' : 'Criar administrador de visualização'}
          </button>
        </div>
      </form>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---

export default function AdminPage() {
  const session = useAdminSession();
  const { status, permissions, user, primaryAdminEmail } = session;
  const canManageContent = !!permissions?.canManageContent;
  const canManageUsers = !!permissions?.canManageUsers;
  const isReadOnly = status === 'ready' && !canManageContent;
  const displayName = user?.displayName || user?.username || 'Administrador(a)';

  const [posts, setPosts] = useState([]);
  const [editorias, setEditorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, postId: null, postTitle: '' });

  useEffect(() => {
    if (status !== 'ready') {
      return undefined;
    }

    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [articles, editoriasData] = await Promise.all([
          apiClient.get('/admin/articles', { signal: controller.signal }),
          apiClient.get('/admin/editorias', { signal: controller.signal }),
        ]);
        setPosts(articles || []);
        setEditorias(editoriasData || []);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    return () => controller.abort();
  }, [status]);

  const openDeleteModal = (postId, postTitle) => {
    if (!canManageContent) {
      setError('Esta conta está em modo de visualização. Exclusões não são permitidas.');
      return;
    }
    setModalState({ isOpen: true, postId, postTitle });
  };

  const closeDeleteModal = () => {
    setModalState({ isOpen: false, postId: null, postTitle: '' });
  };

  const handleDelete = async () => {
    if (!modalState.postId || !canManageContent) {
      closeDeleteModal();
      if (!canManageContent) {
        setError('Tentativa de alteração bloqueada. Apenas o administrador principal pode remover posts.');
      }
      return;
    }

    try {
      await apiClient.delete(`/admin/articles/${modalState.postId}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== modalState.postId));
    } catch (err) {
      setError(err.message);
    } finally {
      closeDeleteModal();
    }
  };

  const stats = useMemo(
    () => ({
      posts: posts.length,
      editorias: editorias.length,
      views: posts.reduce((sum, post) => sum + (post.stats?.views || 0), 0),
      comments: posts.reduce((sum, post) => sum + (post.stats?.commentsCount || 0), 0),
    }),
    [posts, editorias],
  );

  if (status !== 'ready') {
    return (
      <div className="text-center text-gray-300 bg-gray-900/40 border border-gray-800/60 p-8 rounded-lg">
        <p className="text-lg font-semibold">A preparar o painel administrativo seguro…</p>
        <p className="text-sm text-gray-500 mt-2">Aguarde um instante enquanto validamos as permissões desta sessão.</p>
      </div>
    );
  }

  if (error && !posts.length && !editorias.length) {
    return (
      <div className="text-center text-red-400 bg-red-500/10 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Não foi possível carregar o painel</h2>
        <p>{error}</p>
        <p className="text-sm mt-2 text-gray-400">Verifique se o servidor backend está a ser executado e se está autenticado.</p>
      </div>
    );
  }

  const introText = canManageContent
    ? 'Organize editorias, publique conteúdos e acompanhe o desempenho das histórias criadas pela equipa.'
    : 'Sessão em modo de visualização. Explore o painel com total segurança: qualquer tentativa de alteração será bloqueada e registada.';

  return (
    <div>
      {canManageContent && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message={`Tem a certeza que deseja excluir permanentemente o artigo "${modalState.postTitle}"? Esta ação não pode ser desfeita.`}
        />
      )}

      {isReadOnly && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-lg">
          Acesso apenas para visualização. Alterações são bloqueadas automaticamente e ficam registadas nos relatórios de segurança.
        </div>
      )}

      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold">Bem-vinda, {displayName}!</h1>
          <p className="text-gray-400 mt-1 max-w-xl">{introText}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/admin/editorias"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
            <span>Gerir editorias</span>
          </a>
          {canManageContent && (
            <a
              href="/admin/posts/new"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Criar novo post</span>
            </a>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard title="Total de Posts" value={stats.posts} icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" isLoading={isLoading} />
        <StatCard title="Editorias" value={stats.editorias} icon="M3 7h18M3 12h18M3 17h18" isLoading={isLoading} />
        <StatCard title="Visualizações Totais" value={stats.views} icon="M15 12a3 3 0 11-6 0 3 3 0 016 0zM21 12c-1.5 4.5-6 7.5-9 7.5s-7.5-3-9-7.5 3-7.5 9-7.5 7.5 3 9 7.5z" isLoading={isLoading} />
        <StatCard title="Comentários" value={stats.comments} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" isLoading={isLoading} />
      </div>

      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold">Editorias em destaque</h2>
            <p className="text-gray-400 text-sm max-w-2xl">
              Agrupe conteúdos em editorias e mantenha a identidade visual alinhada com a nossa paleta. Para criar uma nova editoria,
              utilize o botão acima e visualize aqui os resultados.
            </p>
          </div>
          <a href="/admin/editorias" className="self-start md:self-center text-sm font-semibold text-red-400 hover:text-red-300">
            Ver todas as editorias
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? [...Array(3)].map((_, index) => <div key={index} className="bg-gray-900/40 rounded-xl h-48 animate-pulse" />)
            : editorias.slice(0, 6).map((editoria) => <EditoriaCard key={editoria._id} editoria={editoria} />)}
          {!isLoading && editorias.length === 0 && (
            <div className="col-span-full bg-gray-900/40 border border-dashed border-gray-700 rounded-xl p-8 text-center text-gray-400">
              Ainda não existem editorias registadas. Clique em "Gerir editorias" para criar a primeira.
            </div>
          )}
        </div>
      </section>

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
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </td>
                    <td className="py-4 px-6"></td>
                  </tr>
                ))
              ) : posts.length > 0 ? (
                posts.slice(0, 4).map((post) => (
                  <PostRow key={post._id} post={post} onDelete={openDeleteModal} canManageContent={canManageContent} />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    {canManageContent
                      ? 'Ainda não existem posts publicados. Utilize o botão "Criar novo post" para começar.'
                      : 'Ainda não existem posts publicados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminViewerForm canManageUsers={canManageUsers} primaryAdminEmail={primaryAdminEmail} />
    </div>
  );
}
