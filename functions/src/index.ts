// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import axios from "axios";

// Inicializa o Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// ===================================================================================
// 🎯 1. CONFIGURAÇÃO E CHAVES
// ===================================================================================
// Idealmente use o Google Secret Manager, mas mantendo sua chave aqui para facilitar o teste:
const BREVO_KEY_FALLBACK = "xkeysib-104d12d7044aa1f2d911f6b5a0699cf7f83aace7855f56e972c6be68875de76f";
const BREVO_TEMPLATE_ID = 1; // ID do template "Bem-vindo" ou "Verificação" no Brevo
// URL do seu projeto (conforme logs de deploy anteriores)
const APP_URL = "https://olloapp-egl2025.web.app"; 

// ===================================================================================
// 📧 2. FUNÇÃO DE VERIFICAÇÃO DE EMAIL (A CORREÇÃO PRINCIPAL)
// ===================================================================================
export const sendBrevoVerificationEmail = onCall(
  { region: "southamerica-east1", timeoutSeconds: 30, secrets: ["BREVO_API_KEY"] },
  async (request) => {
    // 1. Validação de segurança
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login necessário para solicitar verificação.");
    }

    const { email, uid } = request.auth.token;
    const { displayName } = request.data;

    if (!email) {
      throw new HttpsError("invalid-argument", "Email não encontrado no token.");
    }

    logger.info(`[VERIFICAÇÃO] Iniciando processo para: ${email}`);

    try {
      // 2. Rate Limiting (Evitar spam de cliques)
      const db = getFirestore();
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const lastSent = userDoc.data()?.lastVerificationEmailSent?.toDate();
        // Se enviou há menos de 1 minuto, bloqueia
        if (lastSent && (Date.now() - lastSent.getTime() < 60000)) {
          logger.warn(`[VERIFICAÇÃO] Bloqueado por rate limit: ${email}`);
          throw new HttpsError("resource-exhausted", "Aguarde um minuto antes de reenviar.");
        }
      }

      // 3. GERAR O LINK MÁGICO DO FIREBASE (CORREÇÃO DE REDIRECIONAMENTO)
      // Isso garante que após clicar, o usuário volte para o app logado
      const actionCodeSettings = {
        url: `${APP_URL}/`, // Redireciona para a Home após verificar
        handleCodeInApp: true,
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      logger.info(`[VERIFICAÇÃO] Link gerado com sucesso.`);

      // 4. Atualizar timestamp no banco
      await userRef.set({ lastVerificationEmailSent: FieldValue.serverTimestamp() }, { merge: true });

      // 5. Enviar para o Brevo via API (Usando Template ID e Params)
      // Usamos axios direto para garantir controle total sobre os parametros
      const apiKey = process.env.BREVO_API_KEY || BREVO_KEY_FALLBACK;
      
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: email, name: displayName || "Usuário" }],
          templateId: BREVO_TEMPLATE_ID, // Usa o modelo visual configurado no site do Brevo
          params: {
            NOME: displayName || "Usuário",
            LINK_VERIFICACAO: verificationLink, // <--- A variável mágica que vai para o botão
          },
        },
        {
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      return { success: true };

    } catch (error: any) {
      logger.error(`[VERIFICAÇÃO] Erro crítico:`, error);
      throw new HttpsError("internal", "Erro ao processar envio de e-mail.");
    }
  }
);

// ===================================================================================
// 👤 3. TRIGGER: NOVO USUÁRIO CRIADO (Firestore Trigger V2)
// ===================================================================================
// Nota: Funções 'auth.user().onCreate' ainda são V1 na maioria dos projetos ou requerem Identity Platform.
// Mantendo compatibilidade híbrida segura.
import * as functionsV1 from "firebase-functions/v1";

export const onnewusercreated = functionsV1
  .region("southamerica-east1")
  .runWith({ secrets: ["BREVO_API_KEY"], timeoutSeconds: 60 })
  .auth.user().onCreate(async (user) => {
    const { uid, email, displayName, emailVerified } = user;
    const db = getFirestore();

    try {
      // Verifica se documentos já existem para evitar duplicidade
      const userRef = db.collection("users").doc(uid);
      const publicRef = db.collection("users_public").doc(uid);
      const [uDoc, pDoc] = await Promise.all([userRef.get(), publicRef.get()]);

      if (uDoc.exists && pDoc.exists) return;

      const username = await generateUniqueUsername(email, uid);

      // Criação dos perfis no Firestore
      await db.runTransaction(async (t) => {
        if (!uDoc.exists) {
          t.set(userRef, {
            email: email || "",
            displayName: displayName || "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            emailVerified: emailVerified || false,
            profileCreated: true,
            lastVerificationEmailSent: null
          });
        }
        
        if (!pDoc.exists) {
          t.set(publicRef, {
            userId: uid,
            name: displayName || "Usuário OLLO",
            username: username,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'O')}&background=0D4D44&color=fff&bold=true`,
            bio: "Novo na comunidade OLLO! 🎉",
            createdAt: FieldValue.serverTimestamp(),
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            verified: emailVerified || false,
          });
        }
      });

      // Se tiver email, tenta enviar o de verificação automaticamente na criação
      if (email && !emailVerified) {
         // Chama a lógica de envio (reaproveitando lógica interna seria ideal, mas aqui chamamos via evento)
         // Nota: O trigger onCreate não tem "context.auth" para chamar a função onCall.
         // A verificação será pedida pelo Frontend no primeiro login.
      }

    } catch (error) {
      logger.error(`[NOVO USUÁRIO] ERRO:`, error);
    }
  });

// ===================================================================================
// 🗑️ 4. TRIGGER: USUÁRIO DELETADO
// ===================================================================================
export const onUserDelete = functionsV1
  .region("southamerica-east1")
  .auth.user().onDelete(async (user) => {
    const { uid } = user;
    const db = getFirestore();
    try {
      await db.runTransaction(async (t) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        t.delete(privateRef);
        t.delete(publicRef);
      });
      logger.info(`[DELETADO] Dados do usuário ${uid} removidos.`);
    } catch (error) { logger.error(`[EXCLUSÃO] Erro:`, error); }
  });

// ===================================================================================
// 🛠️ 5. FUNÇÕES UTILITÁRIAS (HELPERS)
// ===================================================================================

export const updateEmailVerificationStatus = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário");
    
    const { uid } = request.auth;
    const db = getFirestore();
    
    await db.runTransaction(async (t) => {
      const privateRef = db.collection("users").doc(uid);
      const publicRef = db.collection("users_public").doc(uid);
      
      t.update(privateRef, { emailVerified: true, updatedAt: FieldValue.serverTimestamp() });
      // Verifica se o doc público existe antes de atualizar
      const pubDoc = await t.get(publicRef);
      if (pubDoc.exists) {
        t.update(publicRef, { verified: true });
      }
    });
    return { success: true };
  }
);

async function generateUniqueUsername(email: string | undefined, uid: string): Promise<string> {
  const db = getFirestore();
  let baseUsername = email 
    ? email.split("@")[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    : `user${uid.substring(0, 8)}`;
  
  if (baseUsername.length > 15) baseUsername = baseUsername.substring(0, 15);
  
  let username = baseUsername;
  let counter = 0;
  let isUnique = false;
  
  while (!isUnique && counter < 100) {
    const query = await db.collection("users_public").where("username", "==", username).limit(1).get();
    if (query.empty) isUnique = true;
    else { counter++; username = `${baseUsername}${counter}`; }
  }
  
  if (!isUnique) username = `${baseUsername}${Date.now()}`;
  return username;
}