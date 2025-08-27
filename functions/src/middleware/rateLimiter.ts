// functions/src/middleware/rateLimiter.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Factory de middleware para limitação de taxa (rate limiting)
 * Protege APIs contra abusos, ataques de força bruta e DDoS
 */
export function createRateLimiter(options: {
  windowMs: number;  // Janela de tempo em milissegundos
  maxRequests: number;  // Número máximo de requisições permitidas na janela
  message?: string;  // Mensagem personalizada (opcional)
}) {
  const { windowMs, maxRequests, message = "Muitas requisições, tente novamente mais tarde" } = options;
  
  return async (context: functions.https.CallableContext): Promise<void> => {
    // Não aplicamos limites para requisições admin
    if (context.app) {
      return;
    }
    
    // Precisamos de um UID para controlar as requisições
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Autenticação obrigatória para esta operação"
      );
    }
    
    const uid = context.auth.uid;
    const db = admin.firestore();
    
    // Referência para o documento de controle
    const rateLimitRef = db.collection("rateLimits").doc(uid);
    
    // Executa uma transação para garantir atomicidade
    try {
      const result = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(rateLimitRef);
        const now = Date.now();
        
        // Se não existe o documento ou expirou, cria um novo
        if (!doc.exists || (doc.data()?.resetTime && doc.data()?.resetTime < now)) {
          transaction.set(rateLimitRef, {
            count: 1,
            resetTime: now + windowMs
          });
          return { limited: false };
        }
        
        // Se existe, incrementa o contador
        const currentCount = doc.data()?.count || 0;
        
        // Verifica se excedeu o limite
        if (currentCount >= maxRequests) {
          return { 
            limited: true,
            resetTime: doc.data()?.resetTime
          };
        }
        
        // Atualiza o contador
        transaction.update(rateLimitRef, { count: currentCount + 1 });
        return { limited: false };
      });
      
      // Se o usuário está limitado, lança um erro
      if (result.limited) {
        const resetInSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
        
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `${message}. Tente novamente em ${resetInSeconds} segundos.`,
          { retryAfter: resetInSeconds }
        );
      }
    } catch (error) {
      // Se o erro já é um HttpsError, apenas o repassa
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Caso contrário, registra e lança um erro genérico
      console.error("Erro ao verificar limite de requisições:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Erro ao processar sua requisição"
      );
    }
  };
}

/**
 * Middleware de limite de requisições para APIs sensíveis
 * Limite: 10 requisições por minuto
 */
export const sensitiveApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 10,
  message: "Você excedeu o limite de requisições para esta operação"
});

/**
 * Middleware de limite de requisições para APIs de busca
 * Limite: 30 requisições por minuto
 */
export const searchApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 30,
  message: "Você excedeu o limite de buscas"
});

/**
 * Middleware de limite de requisições para operações críticas
 * Limite: 3 requisições por hora
 */
export const criticalOperationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 3,
  message: "Operação sensível: limite excedido"
});
