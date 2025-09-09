// Lógica completa de autenticação, criação de perfil e verificação de email personalizada.

import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";
import { logger } from "firebase-functions";
import * as Brevo from "@getbrevo/brevo";

admin.initializeApp();

// ===================================================================================
// 🎯 CONFIGURAÇÃO BREVO - CENTRALIZADA
// ===================================================================================
const initBrevoApi = () => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKeyAuth = apiInstance.apiClient.authentications["api-key"];
  apiKeyAuth.apiKey = process.env.BREVO_API_KEY!;
  return apiInstance;
};

const SENDER_INFO = {
  name: "Equipe OLLO",
  email: "contato@olloapp.com.br"
};

// ===================================================================================
// 📧 FUNÇÃO DE VERIFICAÇÃO DE EMAIL PERSONALIZADA - CORS CORRIGIDO
// ===================================================================================
export const sendCustomVerificationEmail = functions
  .region("southamerica-east1")
  .runWith({ 
    secrets: ["BREVO_API_KEY"]
  })
  .https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { uid, email } = context.auth.token;
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email não encontrado');
    }

    logger.info(`[VERIFICAÇÃO] Enviando email personalizado para: ${email}`);

    try {
      // Gerar link de verificação personalizado
      const actionCodeSettings = {
        url: `https://olloapp.com.br/email-verified?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      
      // Enviar via Brevo com template personalizado
      const apiInstance = initBrevoApi();
      
      const sendSmtpEmail = new Brevo.SendSmtpEmail({
        subject: "🔐 Verifique seu email - OLLO",
        htmlContent: `
          <!DOCTYPE html>
          <html lang="pt-br">
          <head>
              <meta charset="UTF-8">
              <title>Verificação de Email - OLLO</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height: 100vh; font-family: Arial, sans-serif;">
              <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; border: 1.5px solid #a8edea;">

                  <div style="display: flex; align-items: flex-start; gap: 18px; margin-bottom: 24px;">
                      <img src="https://storage.googleapis.com/gweb-cloud-media-autogen/website-prd/images/20240728T105822-0/ollo_logo_new.png"
                          alt="OLLO Logo" style="width: 60px; height: auto; border-radius: 7px; display: block; margin-top: 2px;">
                      <div>
                          <h2 style="color: #17925c; font-size: 20px; margin: 2px 0 8px 0; font-weight: bold; letter-spacing: 0.5px;">
                              Verifique seu email, ${context.auth.token.name || "usuário"}!</h2>
                          <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 0;">
                              Para garantir a segurança da sua conta, precisamos verificar seu endereço de email.<br>
                              Clique no botão abaixo para ativar sua conta.
                          </div>
                      </div>
                  </div>

                  <div style="text-align: center; margin: 30px 0 20px 0;">
                      <img src="https://storage.googleapis.com/gweb-cloud-media-autogen/website-prd/images/20240728T105822-0/ollo_eyes_new.png"
                          alt="Olhos OLLO" style="width: 75px; max-width: 100%; height: auto;">
                  </div>

                  <div style="text-align: center; margin: 28px 0 8px 0;">
                      <a href="${verificationLink}"
                          style="display: inline-block; background: linear-gradient(90deg, #3fd08a 0%, #28c4c0 100%); color: #fff; padding: 17px 40px; border-radius: 13px; text-decoration: none; font-size: 18px; font-weight: 700; box-shadow: 0 2px 12px #22b97633; transition: background 0.2s;">
                          Verificar meu email
                      </a>
                  </div>

                  <p style="text-align: center; color: #f39c12; font-size: 13px; margin-top: 30px; margin-bottom: -10px; font-weight: bold;">
                      Não encontrou o e-mail? Verifique sua caixa de Spam.
                  </p>

                  <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px; margin-bottom: 8px;">
                      Se você não criou esta conta, por favor ignore este e-mail.
                  </p>
                  <p style="text-align: center; color: #aaa; font-size: 12px; margin: 0;">
                      Equipe OLLO
                  </p>
              </div>
          </body>
          </html>
        `,
        sender: SENDER_INFO,
        to: [{ 
          email: email, 
          name: context.auth.token.name || "Usuário OLLO" 
        }],
      });

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      logger.info(`[VERIFICAÇÃO] Email personalizado enviado com sucesso para ${email}`, {
        messageId: response.body?.messageId
      });

      return { 
        success: true, 
        message: "Email de verificação personalizado enviado com sucesso!" 
      };

    } catch (error) {
      logger.error(`[VERIFICAÇÃO] Erro ao enviar email para ${email}:`, error);
      throw new functions.https.HttpsError('internal', 'Erro ao enviar email de verificação');
    }
  });

// ===================================================================================
// 👤 FUNÇÃO ACIONADA NA CRIAÇÃO DE UM NOVO USUÁRIO
// ===================================================================================
export const onnewusercreated = functions
  .region("southamerica-east1")
  .runWith({ secrets: ["BREVO_API_KEY"] })
  .auth.user().onCreate(async (user) => {
    const { uid, email, displayName } = user;

    logger.info(`[NOVO USUÁRIO] Gatilho para: ${uid}, Email: ${email}`);

    // --- Bloco de Criação de Documentos no Firestore ---
    try {
      const db = getFirestore();
      const batch = db.batch();

      // 1. Documento na coleção privada 'users'
      const privateProfileRef = db.collection("users").doc(uid);
      const privateData = {
        email: email || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false, // Importante para controle
      };
      batch.set(privateProfileRef, privateData);

      // 2. Documento na coleção pública 'users_public'
      const publicProfileRef = db.collection("users_public").doc(uid);
      const username = (email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, '') || `user${uid.substring(0, 5)}`).toLowerCase();
      const publicData = {
        userId: uid, // Adicionado para facilitar queries
        name: displayName || "Usuário OLLO",
        username: username,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'O')}&background=0D4D44&color=fff&bold=true`,
        bio: "Novo na comunidade OLLO! 🎉",
        createdAt: new Date(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        verified: false,
      };
      batch.set(publicProfileRef, publicData);
      
      // 3. Executa as duas escritas de uma vez
      await batch.commit();
      logger.info(`[PERFIL] Documentos criados com sucesso para ${uid}`);

    } catch (error) {
      logger.error(`[PERFIL] ERRO ao criar documentos para ${uid}:`, error);
    }
    
    // --- Bloco de Envio de E-mail de Boas-vindas ---
    if (!user.email) {
      logger.warn(`[BOAS-VINDAS] Usuário ${uid} sem email, pulando envio`);
      return;
    }

    logger.info(`[BOAS-VINDAS] Enviando para ${user.email}`);

    try {
      const apiInstance = initBrevoApi();

      const sendSmtpEmail = new Brevo.SendSmtpEmail({
        subject: "🎉 Bem-vindo(a) ao OLLO!",
        htmlContent: `
          <!DOCTYPE html>
          <html lang="pt-br">
          <head>
              <meta charset="UTF-8">
              <title>Bem-vindo(a) ao OLLO!</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height: 100vh; font-family: Arial, sans-serif;">
              <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; border: 1.5px solid #a8edea;">

                  <div style="display: flex; align-items: flex-start; gap: 18px; margin-bottom: 24px;">
                      <img src="https://storage.googleapis.com/gweb-cloud-media-autogen/website-prd/images/20240728T105822-0/ollo_logo_new.png"
                          alt="OLLO Logo" style="width: 60px; height: auto; border-radius: 7px; display: block; margin-top: 2px;">
                      <div>
                          <h2 style="color: #17925c; font-size: 20px; margin: 2px 0 8px 0; font-weight: bold; letter-spacing: 0.5px;">
                              Bem-vindo(a), ${user.displayName || "usuário"}!</h2>
                          <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 0;">
                              Sua jornada começa aqui, onde cada olhar faz a diferença.<br>
                              Não esqueça de verificar seu email para ativar sua conta completamente!
                          </div>
                      </div>
                  </div>

                  <div style="text-align: center; margin: 30px 0 20px 0;">
                      <img src="https://storage.googleapis.com/gweb-cloud-media-autogen/website-prd/images/20240728T105822-0/ollo_eyes_new.png"
                          alt="Olhos OLLO" style="width: 75px; max-width: 100%; height: auto;">
                  </div>

                  <div style="background: #f8fffe; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #17925c;">
                      <h3 style="color: #17925c; margin: 0 0 12px; font-size: 16px; font-weight: bold;">O que você pode fazer no OLLO:</h3>
                      <ul style="color: #444; line-height: 1.6; font-size: 14px; margin: 0; padding-left: 20px;">
                          <li>Conectar-se com pessoas incríveis</li>
                          <li>Compartilhar seus momentos e ideias</li>
                          <li>Descobrir produtos no marketplace</li>
                          <li>Participar de conversas interessantes</li>
                      </ul>
                  </div>

                  <div style="text-align: center; margin: 28px 0 8px 0;">
                      <a href="https://olloapp.com.br"
                          style="display: inline-block; background: linear-gradient(90deg, #3fd08a 0%, #28c4c0 100%); color: #fff; padding: 17px 40px; border-radius: 13px; text-decoration: none; font-size: 18px; font-weight: 700; box-shadow: 0 2px 12px #22b97633; transition: background 0.2s;">
                          Explorar OLLO
                      </a>
                  </div>

                  <p style="text-align: center; color: #f39c12; font-size: 13px; margin-top: 30px; margin-bottom: -10px; font-weight: bold;">
                      Precisa de ajuda? Entre em contato conosco!
                  </p>

                  <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px; margin-bottom: 8px;">
                      Obrigado por fazer parte da nossa comunidade.
                  </p>
                  <p style="text-align: center; color: #aaa; font-size: 12px; margin: 0;">
                      Equipe OLLO
                  </p>
              </div>
          </body>
          </html>
        `,
        sender: SENDER_INFO,
        to: [{ 
          email: user.email, 
          name: user.displayName || "Novo Usuário" 
        }],
      });
      
      const brevoResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
      logger.info(`[BOAS-VINDAS] Email enviado com sucesso para ${user.email}`, {
        messageId: brevoResponse.body?.messageId
      });

    } catch (error) {
      const errorDetails = error instanceof Error ? (error as any).response?.body || error.message : error;
      logger.error(`[BOAS-VINDAS] ERRO ao enviar email para ${user.email}:`, {
        userId: user.uid,
        error: errorDetails,
      });
    }
  });

// ===================================================================================
// 🗑️ FUNÇÃO ACIONADA NA EXCLUSÃO DE UM USUÁRIO
// ===================================================================================
export const onUserDelete = functions
  .region("southamerica-east1")
  .auth.user().onDelete(async (user) => {
    const { uid } = user;

    logger.info(`[EXCLUSÃO] Usuário ${uid} excluído, iniciando limpeza`);

    const db = getFirestore();
    const batch = db.batch();

    try {
      // 1. Excluir perfil privado
      const privateProfileRef = db.collection("users").doc(uid);
      batch.delete(privateProfileRef);

      // 2. Excluir perfil público
      const publicProfileRef = db.collection("users_public").doc(uid);
      batch.delete(publicProfileRef);
      
      // 3. Executar limpeza
      await batch.commit();
      logger.info(`[EXCLUSÃO] Dados do usuário ${uid} limpos com sucesso`);
      
    } catch (error) {
      logger.error(`[EXCLUSÃO] Erro ao limpar dados do usuário ${uid}:`, error);
    }
  });

// ===================================================================================
// 🔄 FUNÇÃO PARA ATUALIZAR STATUS DE VERIFICAÇÃO DE EMAIL - CORS CORRIGIDO
// ===================================================================================
export const updateEmailVerificationStatus = functions
  .region("southamerica-east1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { uid } = context.auth;

    try {
      const db = getFirestore();
      
      // Atualizar documento privado
      await db.collection("users").doc(uid).update({
        emailVerified: true,
        updatedAt: new Date(),
      });

      // Atualizar documento público
      await db.collection("users_public").doc(uid).update({
        verified: true,
      });

      logger.info(`[VERIFICAÇÃO] Status atualizado para usuário ${uid}`);
      
      return { success: true, message: "Status de verificação atualizado!" };
      
    } catch (error) {
      logger.error(`[VERIFICAÇÃO] Erro ao atualizar status para ${uid}:`, error);
      throw new functions.https.HttpsError('internal', 'Erro ao atualizar status');
    }
  });