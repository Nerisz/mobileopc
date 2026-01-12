// src/services/mockAuth.ts

// 1. Definimos nossa própria interface de User (substituindo a do Supabase)
export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token: string; // Token fake
}

// 2. Criamos o Usuário Mockado (Fixo)
export const MOCK_USER: AppUser = {
  id: 'user-demo-123',
  email: 'usuario@demo.com', // Na lógica vamos aceitar qualquer email, mas usaremos esses dados
  name: 'Entrevistador(a)',
  avatarUrl: 'https://github.com/github.png', // Uma imagem real para ficar bonito na UI
  token: 'fake-jwt-token-xyz',
};

// 3. Serviço de Autenticação Fake (Simula a API)
export const mockAuthService = {
  signIn: async (email: string, password: string): Promise<AppUser> => {
    // Simula delay de rede (1.5 segundos) - Importante para mostrar Loading na tela
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validação básica fake
    if (!email.includes('@') || password.length < 3) {
      throw new Error('Email inválido ou senha muito curta.');
    }

    // Sucesso: Retorna o usuario mockado, mas injeta o email que a pessoa digitou
    // para dar sensação de realidade
    return {
      ...MOCK_USER,
      email: email, 
    };
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};