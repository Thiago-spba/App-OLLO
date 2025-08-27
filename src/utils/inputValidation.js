/**
 * Utilitários de validação e sanitização de entrada para o App OLLO
 * Usado para evitar injeção de código e garantir segurança dos dados
 */

/**
 * Sanitiza strings para prevenir XSS e outros ataques
 * @param {string} input - String para sanitizar
 * @return {string} - String sanitizada
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove tags HTML e códigos maliciosos
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Valida um email
 * @param {string} email - Email para validar
 * @return {boolean} - Se o email é válido
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Regex para validação de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Valida um nome de usuário (alfanumérico com _ e .)
 * @param {string} username - Username para validar
 * @return {boolean} - Se o username é válido
 */
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // Usernames: 3-20 caracteres, alfanuméricos, _ e .
  const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Valida se a senha atende aos requisitos de segurança
 * @param {string} password - Senha para validar
 * @return {{isValid: boolean, message: string}} - Resultado da validação e mensagem
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'A senha é obrigatória' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'A senha deve conter pelo menos um número' };
  }
  
  return { isValid: true, message: 'Senha válida' };
}

/**
 * Valida um objeto de dados de perfil
 * @param {Object} profileData - Dados do perfil para validar
 * @return {{isValid: boolean, errors: Object}} - Resultado da validação
 */
export function validateProfileData(profileData) {
  const errors = {};
  
  // Valida nome
  if (!profileData.name || profileData.name.trim().length < 2) {
    errors.name = 'O nome deve ter pelo menos 2 caracteres';
  }
  
  // Valida username
  if (!isValidUsername(profileData.username)) {
    errors.username = 'Nome de usuário inválido (3-20 caracteres, apenas letras, números, _ e .)';
  }
  
  // Valida bio (opcional, mas com limite de caracteres)
  if (profileData.bio && profileData.bio.length > 500) {
    errors.bio = 'A bio deve ter no máximo 500 caracteres';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida e sanitiza dados de um post
 * @param {Object} postData - Dados do post
 * @return {{isValid: boolean, data: Object, errors: Object}} - Resultado
 */
export function validateAndSanitizePostData(postData) {
  const errors = {};
  const sanitizedData = { ...postData };
  
  // Valida conteúdo
  if (!postData.content || postData.content.trim().length === 0) {
    errors.content = 'O conteúdo do post é obrigatório';
  } else if (postData.content.length > 5000) {
    errors.content = 'O conteúdo do post deve ter no máximo 5000 caracteres';
  } else {
    sanitizedData.content = sanitizeString(postData.content);
  }
  
  // Validação de imagens (apenas URLs seguras)
  if (postData.imageUrl) {
    if (!/^https:\/\//.test(postData.imageUrl)) {
      errors.imageUrl = 'A URL da imagem deve usar HTTPS';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    data: sanitizedData,
    errors
  };
}
