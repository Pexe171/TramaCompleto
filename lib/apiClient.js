// Este ficheiro centraliza toda a comunicação com a sua API backend.

// A URL base da sua API. Em um projeto real, isto viria de uma variável de ambiente.
const API_URL = 'http://localhost:5000/api';

// Função auxiliar para fazer os pedidos (requests)
async function fetcher(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  // Tenta obter o token de autenticação guardado no localStorage.
  // A página de login será responsável por guardar este token.
  const token = localStorage.getItem('authToken');

  // Configurações padrão para todos os pedidos
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Se um token existir, adiciona-o ao cabeçalho de Autorização
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      // Se a resposta não for bem-sucedida, tenta extrair a mensagem de erro da API
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro na comunicação com a API.');
    }

    // Se a resposta for bem-sucedida, retorna os dados em formato JSON
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    // Propaga o erro para que o componente que fez a chamada possa tratá-lo
    throw error;
  }
}

// Exporta métodos específicos para cada tipo de pedido (GET, POST, etc.)
export const apiClient = {
  get: (endpoint) => fetcher(endpoint),
  post: (endpoint, body) => fetcher(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetcher(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetcher(endpoint, { method: 'DELETE' }),
};
