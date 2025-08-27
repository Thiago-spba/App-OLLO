/**
 * OLLO - Utilitário para tratamento de erros de autenticação
 * Este arquivo contém funções para identificar e tratar problemas comuns
 * de autenticação, incluindo erros de CORS, bloqueio de origens, etc.
 */

/**
 * Analisa um erro do Firebase e retorna uma mensagem amigável
 * @param {Error} error - O erro recebido do Firebase
 * @returns {Object} - Objeto com código e mensagem formatada
 */
export function parseAuthError(error) {
  // Código de erro padrão
  const result = {
    code: error?.code || 'auth/unknown',
    message: 'Ocorreu um erro inesperado. Tente novamente.'
  };
  
  // Mapeamento de erros comuns para mensagens amigáveis
  const errorMessages = {
    'auth/email-already-in-use': 'Este e-mail já está sendo usado por outra conta.',
    'auth/invalid-email': 'O e-mail informado não é válido.',
    'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
    'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta. Verifique e tente novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/popup-closed-by-user': 'Login cancelado. Tente novamente.',
    'auth/popup-blocked': 'O popup de login foi bloqueado. Permita popups para o site.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/invalid-credential': 'Credenciais inválidas. Verifique seus dados.',
    'auth/operation-not-allowed': 'Este método de login não está habilitado.',
    'auth/account-exists-with-different-credential': 'Este e-mail já está associado a outra conta com outro método de login.',
    'auth/requires-recent-login': 'Esta operação requer login recente. Faça login novamente.',
    'auth/cancelled-popup-request': 'Operação cancelada. Tente novamente.',
    'auth/unauthorized-domain': 'Este domínio não está autorizado para operações de login.',
    'auth/requests-from-referer-are-blocked': 'Solicitações deste domínio estão bloqueadas por configurações de segurança.',
  };
  
  // Verifica se é um erro de CORS baseado na mensagem
  const isCorsError = error?.message?.includes('CORS') || 
                      error?.code?.includes('unauthorized-domain') || 
                      error?.code?.includes('requests-from-referer-are-blocked');
  
  // Tratamento específico para erros de CORS
  if (isCorsError) {
    result.code = 'auth/cors-error';
    result.message = 'Erro de acesso ao servidor. O domínio atual não está autorizado.';
    result.details = 'Este problema geralmente ocorre quando o domínio não está na lista de domínios autorizados no Firebase.';
    result.solution = 'Verifique se o domínio está configurado no console do Firebase ou tente acessar usando um domínio autorizado.';
    
    // Log técnico apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('[OLLO] Erro CORS detectado:', {
        origin: window.location.origin,
        errorCode: error?.code,
        errorMessage: error?.message,
        details: 'Adicione este domínio ao console do Firebase: Authentication > Settings > Authorized Domains'
      });
    }
  } else if (errorMessages[result.code]) {
    // Atribui a mensagem específica do código de erro
    result.message = errorMessages[result.code];
  } else if (error?.message) {
    // Usa a mensagem original para erros desconhecidos
    result.message = error.message;
  }
  
  return result;
}

/**
 * Verifica se o ambiente atual pode ter problemas de CORS
 * @returns {boolean} - true se há risco de problemas de CORS
 */
export function checkForCorsPotentialIssues() {
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  const isDevelopmentPort = ['5173', '5174', '5175', '5176', '5177', '3000'].includes(window.location.port);
  
  return isLocalhost && isDevelopmentPort;
}

/**
 * Exibe um alerta sobre possíveis problemas de CORS
 * Útil para desenvolvimento
 */
export function showCorsAlert() {
  if (import.meta.env.DEV && checkForCorsPotentialIssues()) {
    console.warn(`
      [OLLO] Aviso de desenvolvimento: 
      Detectado ambiente local (${window.location.origin}) que pode apresentar problemas de CORS.
      
      Para resolver:
      1. Adicione ${window.location.origin} ao Firebase Console: Authentication > Settings > Authorized Domains
      2. Verifique se cors.json está configurado corretamente
      3. Considere usar os emuladores Firebase para desenvolvimento
      
      Se o problema persistir, consulte o guia em REGISTRO_DE_SEGURANCA.md
    `);
  }
}

// Executa a verificação automaticamente
if (typeof window !== 'undefined') {
  showCorsAlert();
}
