import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import axios from "axios";
import * as functionsV1 from "firebase-functions/v1";

// Inicializa o Admin SDK apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp();
}

// CONFIGURAÇÃO GERAL
const APP_URL = "https://olloapp.com.br";
const BREVO_TEMPLATE_ID = 1; 

// --- FUNÇÃO 1: Enviar E-mail de Verificação (Callable) ---
// Esta função é chamada diretamente pelo seu Frontend (React)
export const sendBrevoVerificationEmail = onCall(
  { 
    region: "southamerica-east1", 
    timeoutSeconds: 30 
  },
  async (request) => {
    // 1. Segurança: Só permite usuários logados
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login necessário para solicitar verificação.");
    }

    // 2. Recupera a chave de API do ambiente seguro do Firebase
    // ATENÇÃO: Se der erro aqui, é porque faltou rodar o comando no terminal (veja abaixo)
    const brevoKey = functionsV1.config().brevo?.key;
    if (!brevoKey) {
      logger.error("ERRO CRÍTICO: Chave do Brevo não configurada no ambiente.");
      throw new HttpsError("internal", "Erro de configuração no servidor.");
    }

    const { email, uid } = request.auth.token;
    const displayName = (request.data && request.data.displayName) ? request.data.displayName : "Usuário";

    if (!email) throw new HttpsError("invalid-argument", "O usuário não possui e-mail cadastrado.");

    try {
      const db = getFirestore();

      // 3. Gera o link oficial de verificação do Firebase
      const actionCodeSettings = {
        url: `${APP_URL}/`,          // Para onde vai após clicar (Home)
        handleCodeInApp: false,      // Deixa o Firebase lidar com a validação
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      
      // 4. Registra no banco que enviamos (bom para evitar spam de cliques)
      const userRef = db.collection("users").doc(uid);
      await userRef.set(
        { lastVerificationEmailSent: FieldValue.serverTimestamp() },
        { merge: true }
      );

      // 5. Envia o e-mail via API do Brevo
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: "Equipe OLLO", email: "no-reply@olloapp.com.br" },
          to: [{ email: email, name: displayName }],
          templateId: BREVO_TEMPLATE_ID,
          params: {
            NOME: displayName,
            LINK: verificationLink, // O link mágico do Firebase
            URL: verificationLink,
          },
        },
        {
          headers: {
            "api-key": brevoKey, // Usa a variável segura
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      logger.info(`E-mail de verificação enviado para ${email}`);
      return { success: true };

    } catch (error: any) {
      logger.error("[ERRO] sendBrevoVerificationEmail", error);
      // Retorna erro genérico para o cliente, mas loga o detalhe no servidor
      throw new HttpsError("internal", "Não foi possível enviar o e-mail.");
    }
  }
);

// --- FUNÇÃO 2: Criar Usuário no Banco (Trigger) ---
// Roda automaticamente quando alguém cria conta no Authentication
export const onnewusercreated = functionsV1
  .region("southamerica-east1")
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email, displayName, emailVerified } = user;
    const db = getFirestore();
    
    try {
      // Gera um username único base
      let base = email ? email.split("@")[0] : `user${uid.substring(0, 5)}`;
      base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      
      // Verifica se já existe, se sim, adiciona timestamp
      const query = await db.collection("users_public").where("username", "==", base).get();
      const username = query.empty ? base : `${base}${Date.now().toString().slice(-4)}`;

      // Salva dados em duas coleções (Privada e Pública)
      await db.runTransaction(async (t) => {
        // Dados privados (só o usuário vê)
        t.set(db.collection("users").doc(uid), {
          email: email || "",
          displayName: displayName || "",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          emailVerified: emailVerified || false,
          profileCreated: true,
        });

        // Dados públicos (outros usuários veem)
        t.set(db.collection("users_public").doc(uid), {
          userId: uid,
          name: displayName || "Usuário OLLO",
          username: username,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "O")}&background=0D4D44&color=fff&bold=true`,
          createdAt: FieldValue.serverTimestamp(),
          verified: emailVerified || false,
        });
      });
    } catch (e) {
      logger.error("Erro em onnewusercreated", e);
    }
  });

// --- FUNÇÃO 3: Limpeza de Usuário (Trigger) ---
// Roda automaticamente se o usuário for deletado do Auth
export const onUserDelete = functionsV1
  .region("southamerica-east1")
  .auth.user()
  .onDelete(async (user) => {
    const db = getFirestore();
    try {
      await db.runTransaction(async (t) => {
        t.delete(db.collection("users").doc(user.uid));
        t.delete(db.collection("users_public").doc(user.uid));
      });
      logger.info(`Dados do usuário ${user.uid} deletados com sucesso.`);
    } catch (e) {
      logger.error("Erro em onUserDelete", e);
    }
  });

// --- FUNÇÃO 4: Atualizar Status Manualmente (Opcional) ---
// Pode ser usada caso precise forçar a atualização do status no banco
export const updateEmailVerificationStatus = onCall(
  { region: "southamerica-east1" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Negado");
    
    const { uid } = request.auth;
    const db = getFirestore();
    
    try {
        await db.runTransaction(async (t) => {
        t.update(db.collection("users").doc(uid), { emailVerified: true });
        
        const pubRef = db.collection("users_public").doc(uid);
        const pubDoc = await t.get(pubRef);
        if (pubDoc.exists) {
            t.update(pubRef, { verified: true });
        }
        });
        return { success: true };
    } catch (e) {
        logger.error("Erro ao atualizar status manual", e);
        throw new HttpsError("internal", "Erro ao atualizar banco de dados");
    }
  }
);