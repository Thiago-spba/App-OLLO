// src/utils/securityLogger.js
import { db, auth } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Níveis de log de segurança
 */
export const LogLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Tipos de eventos de segurança
 */
export const EventType = {
  AUTH: 'auth',
  ACCESS: 'access',
  DATA: 'data',
  ADMIN: 'admin',
  API: 'api'
};

/**
 * Logger de segurança
 * Registra eventos relacionados à segurança para auditoria e monitoramento
 */
const securityLogger = {
  /**
   * Registra um evento de segurança no Firestore
   * @param {Object} event - Dados do evento
   * @param {string} event.type - Tipo do evento (AUTH, ACCESS, DATA, etc)
   * @param {string} event.action - Ação específica
   * @param {string} event.level - Nível de gravidade (INFO, WARNING, ERROR, CRITICAL)
   * @param {string} event.details - Detalhes adicionais
   * @param {Object} event.metadata - Metadados opcionais
   * @returns {Promise<void>}
   */
  async logEvent({ type, action, level = LogLevel.INFO, details = '', metadata = {} }) {
    try {
      // Obtém o usuário atual
      const currentUser = auth.currentUser;
      
      // Dados básicos do evento
      const eventData = {
        type,
        action,
        level,
        details,
        timestamp: serverTimestamp(),
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || 'anonymous',
        // Informações do cliente
        client: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          // Coleta apenas informações públicas e relevantes
          screen: `${window.innerWidth}x${window.innerHeight}`
        },
        // Metadados adicionais
        ...metadata
      };
      
      // Registra no Firestore
      await addDoc(collection(db, 'security_logs'), eventData);
      
      // Também loga no console em ambiente de desenvolvimento
      if (import.meta.env.DEV) {
        console.info(`[OLLO Security] ${level.toUpperCase()} - ${type}/${action}: ${details}`);
      }
      
      // Para eventos críticos, podemos implementar ações adicionais aqui
      if (level === LogLevel.CRITICAL) {
        // Por exemplo, notificar administradores em tempo real
        // implementar aqui...
      }
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
      
      // Em caso de falha no registro remoto, registra localmente
      console.warn(`[OLLO Security Fallback] ${level.toUpperCase()} - ${type}/${action}: ${details}`);
    }
  },
  
  /**
   * Atalho para registrar evento de autenticação
   * @param {string} action - Ação de autenticação (login, logout, register, etc)
   * @param {string} details - Detalhes adicionais
   * @param {Object} metadata - Metadados opcionais
   * @param {string} level - Nível de gravidade
   */
  auth(action, details = '', metadata = {}, level = LogLevel.INFO) {
    this.logEvent({
      type: EventType.AUTH,
      action,
      details,
      metadata,
      level
    });
  },
  
  /**
   * Atalho para registrar evento de acesso
   * @param {string} action - Ação de acesso (page_view, resource_access, etc)
   * @param {string} details - Detalhes adicionais
   * @param {Object} metadata - Metadados opcionais
   * @param {string} level - Nível de gravidade
   */
  access(action, details = '', metadata = {}, level = LogLevel.INFO) {
    this.logEvent({
      type: EventType.ACCESS,
      action,
      details,
      metadata,
      level
    });
  },
  
  /**
   * Atalho para registrar evento de manipulação de dados
   * @param {string} action - Ação sobre dados (create, update, delete, etc)
   * @param {string} details - Detalhes adicionais
   * @param {Object} metadata - Metadados opcionais
   * @param {string} level - Nível de gravidade
   */
  data(action, details = '', metadata = {}, level = LogLevel.INFO) {
    this.logEvent({
      type: EventType.DATA,
      action,
      details,
      metadata,
      level
    });
  }
};

export default securityLogger;
