// Lógica completa de autenticação, criação de perfil e verificação de email personalizada.
// VERSÃO CORRIGIDA - URL sem www

import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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
// 🔧 FUNÇÕES AUXILIARES
// ===================================================================================

/**
 * Gera um username único baseado no email
 */
async function generateUniqueUsername(email: string | undefined, uid: string): Promise<string> {
  const db = getFirestore();
  
  let baseUsername = email 
    ? email.split("@")[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    : `user${uid.substring(0, 8)}`;
  
  if (baseUsername.length > 15) {
    baseUsername = baseUsername.substring(0, 15);
  }
  
  let username = baseUsername;
  let counter = 0;
  let isUnique = false;
  
  while (!isUnique && counter < 100) {
    const query = await db
      .collection("users_public")
      .where("username", "==", username)
      .limit(1)
      .get();
    
    if (query.empty) {
      isUnique = true;
    } else {
      counter++;
      username = `${baseUsername}${counter}`;
    }
  }
  
  if (!isUnique) {
    username = `${baseUsername}${Date.now()}`;
  }
  
  return username;
}

/**
 * Verifica se os documentos do usuário já existem
 */
async function userDocumentsExist(uid: string): Promise<{
  privateExists: boolean;
  publicExists: boolean;
}> {
  const db = getFirestore();
  
  const [privateDoc, publicDoc] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("users_public").doc(uid).get()
  ]);
  
  return {
    privateExists: privateDoc.exists,
    publicExists: publicDoc.exists
  };
}

// ===================================================================================
// 📧 FUNÇÃO DE VERIFICAÇÃO DE EMAIL PERSONALIZADA - URL CORRIGIDA
// ===================================================================================
export const sendCustomVerificationEmail = functions
  .region("southamerica-east1")
  .runWith({ 
    secrets: ["BREVO_API_KEY"],
    timeoutSeconds: 30
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { uid, email } = context.auth.token;
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email não encontrado');
    }

    logger.info(`[VERIFICAÇÃO] Enviando email personalizado para: ${email}`);

    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const lastEmailSent = userData?.lastVerificationEmailSent?.toDate();
        
        if (lastEmailSent) {
          const timeDiff = Date.now() - lastEmailSent.getTime();
          const minInterval = 60000;
          
          if (timeDiff < minInterval) {
            throw new functions.https.HttpsError(
              'resource-exhausted', 
              `Por favor, aguarde ${Math.ceil((minInterval - timeDiff) / 1000)} segundos antes de solicitar outro email`
            );
          }
        }
      }

      // ✅ CORREÇÃO: URL sem www + continueUrl correto
      const actionCodeSettings = {
        url: 'https://olloapp.com.br/email-verified',
        handleCodeInApp: false,
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      
      logger.info(`[VERIFICAÇÃO] Link gerado: ${verificationLink}`);
      
      await db.collection("users").doc(uid).update({
        lastVerificationEmailSent: FieldValue.serverTimestamp()
      });
      
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
                              Verifique seu email!</h2>
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
      
      logger.info(`[VERIFICAÇÃO] Email enviado com sucesso para ${email}`, {
        messageId: response.body?.messageId
      });

      return { 
        success: true, 
        message: "Email de verificação enviado com sucesso!" 
      };

    } catch (error) {
      logger.error(`[VERIFICAÇÃO] Erro ao enviar email para ${email}:`, error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', 'Erro ao enviar email de verificação');
    }
  });

// ===================================================================================
// 👤 FUNÇÃO ACIONADA NA CRIAÇÃO DE UM NOVO USUÁRIO
// ===================================================================================
export const onnewusercreated = functions
  .region("southamerica-east1")
  .runWith({ 
    secrets: ["BREVO_API_KEY"],
    timeoutSeconds: 60
  })
  .auth.user().onCreate(async (user) => {
    const { uid, email, displayName, emailVerified } = user;

    logger.info(`[NOVO USUÁRIO] Processando: ${uid}, Email: ${email}`);

    const db = getFirestore();
    
    try {
      const { privateExists, publicExists } = await userDocumentsExist(uid);
      
      if (privateExists && publicExists) {
        logger.info(`[NOVO USUÁRIO] Documentos já existem para ${uid}, pulando criação`);
        if (email && !emailVerified) {
          await sendWelcomeEmail(user);
        }
        return;
      }
      
      const username = await generateUniqueUsername(email, uid);
      logger.info(`[NOVO USUÁRIO] Username gerado: ${username} para ${uid}`);
      
      await db.runTransaction(async (transaction) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        
        const [privateSnap, publicSnap] = await Promise.all([
          transaction.get(privateRef),
          transaction.get(publicRef)
        ]);
        
        if (!privateSnap.exists) {
          const privateData = {
            email: email || "",
            displayName: displayName || "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            emailVerified: emailVerified || false,
            profileCreated: true,
            lastVerificationEmailSent: null
          };
          transaction.set(privateRef, privateData);
          logger.info(`[NOVO USUÁRIO] Documento privado criado para ${uid}`);
        }
        
        if (!publicSnap.exists) {
          const publicData = {
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
          };
          transaction.set(publicRef, publicData);
          logger.info(`[NOVO USUÁRIO] Documento público criado para ${uid}`);
        }
      });
      
      logger.info(`[NOVO USUÁRIO] Perfis criados com sucesso para ${uid}`);
      
      if (email) {
        await sendWelcomeEmail(user);
      }
      
    } catch (error) {
      logger.error(`[NOVO USUÁRIO] ERRO ao processar usuário ${uid}:`, {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        uid,
        email
      });
    }
  });

// ===================================================================================
// 📧 FUNÇÃO AUXILIAR PARA ENVIAR EMAIL DE BOAS-VINDAS
// ===================================================================================
async function sendWelcomeEmail(user: admin.auth.UserRecord): Promise<void> {
  if (!user.email) {
    logger.warn(`[BOAS-VINDAS] Usuário ${user.uid} sem email, pulando envio`);
    return;
  }

  const db = getFirestore();
  
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists && userDoc.data()?.welcomeEmailSent) {
      logger.info(`[BOAS-VINDAS] Email já foi enviado para ${user.email}`);
      return;
    }

    logger.info(`[BOAS-VINDAS] Enviando para ${user.email}`);

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
                            ${!user.emailVerified ? 'Não esqueça de verificar seu email para ativar sua conta completamente!' : 'Sua conta está pronta para uso!'}
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
    
    await db.collection("users").doc(user.uid).update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: FieldValue.serverTimestamp()
    });

  } catch (error) {
    const errorDetails = error instanceof Error ? (error as any).response?.body || error.message : error;
    logger.error(`[BOAS-VINDAS] ERRO ao enviar email para ${user.email}:`, {
      userId: user.uid,
      error: errorDetails,
    });
  }
}

// ===================================================================================
// 🗑️ FUNÇÃO ACIONADA NA EXCLUSÃO DE UM USUÁRIO
// ===================================================================================
export const onUserDelete = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 30 })
  .auth.user().onDelete(async (user) => {
    const { uid } = user;

    logger.info(`[EXCLUSÃO] Usuário ${uid} excluído, iniciando limpeza`);

    const db = getFirestore();
    
    try {
      await db.runTransaction(async (transaction) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        
        const [privateSnap, publicSnap] = await Promise.all([
          transaction.get(privateRef),
          transaction.get(publicRef)
        ]);
        
        if (privateSnap.exists) {
          transaction.delete(privateRef);
        }
        
        if (publicSnap.exists) {
          transaction.delete(publicRef);
        }
      });
      
      logger.info(`[EXCLUSÃO] Dados do usuário ${uid} limpos com sucesso`);
      
    } catch (error) {
      logger.error(`[EXCLUSÃO] Erro ao limpar dados do usuário ${uid}:`, error);
    }
  });

// ===================================================================================
// 🔄 FUNÇÃO PARA ATUALIZAR STATUS DE VERIFICAÇÃO DE EMAIL
// ===================================================================================
export const updateEmailVerificationStatus = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { uid } = context.auth;

    try {
      const db = getFirestore();
      
      await db.runTransaction(async (transaction) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        
        const [privateSnap, publicSnap] = await Promise.all([
          transaction.get(privateRef),
          transaction.get(publicRef)
        ]);
        
        if (!privateSnap.exists || !publicSnap.exists) {
          throw new Error('Documentos do usuário não encontrados');
        }
        
        transaction.update(privateRef, {
          emailVerified: true,
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.update(publicRef, {
          verified: true,
        });
      });

      logger.info(`[VERIFICAÇÃO] Status atualizado para usuário ${uid}`);
      
      return { success: true, message: "Status de verificação atualizado!" };
      
    } catch (error) {
      logger.error(`[VERIFICAÇÃO] Erro ao atualizar status para ${uid}:`, error);
      throw new functions.https.HttpsError('internal', 'Erro ao atualizar status');
    }
  });

// ===================================================================================
// 🔧 FUNÇÃO DE MANUTENÇÃO - Corrigir perfis existentes
// ===================================================================================
export const fixExistingProfiles = functions
  .region("southamerica-east1")
  .runWith({ 
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .https.onRequest(async (req, res) => {
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
      res.status(401).send('Unauthorized');
      return;
    }

    const db = getFirestore();
    let fixed = 0;
    let errors = 0;

    try {
      const listUsersResult = await admin.auth().listUsers(1000);
      
      for (const user of listUsersResult.users) {
        try {
          const { privateExists, publicExists } = await userDocumentsExist(user.uid);
          
          if (!privateExists || !publicExists) {
            logger.info(`[FIX] Corrigindo perfil para ${user.uid}`);
            
            const username = await generateUniqueUsername(user.email, user.uid);
            
            await db.runTransaction(async (transaction) => {
              const privateRef = db.collection("users").doc(user.uid);
              const publicRef = db.collection("users_public").doc(user.uid);
              
              if (!privateExists) {
                transaction.set(privateRef, {
                  email: user.email || "",
                  displayName: user.displayName || "",
                  createdAt: FieldValue.serverTimestamp(),
                  updatedAt: FieldValue.serverTimestamp(),
                  emailVerified: user.emailVerified || false,
                  profileCreated: true,
                  fixedByMaintenance: true
                });
              }
              
              if (!publicExists) {
                transaction.set(publicRef, {
                  userId: user.uid,
                  name: user.displayName || "Usuário OLLO",
                  username: username,
                  avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'O')}&background=0D4D44&color=fff&bold=true`,
                  bio: "Membro da comunidade OLLO",
                  createdAt: FieldValue.serverTimestamp(),
                  postsCount: 0,
                  followersCount: 0,
                  followingCount: 0,
                  verified: user.emailVerified || false,
                  fixedByMaintenance: true
                });
              }
            });
            
            fixed++;
          }
        } catch (error) {
          logger.error(`[FIX] Erro ao corrigir usuário ${user.uid}:`, error);
          errors++;
        }
      }
      
      res.json({
        success: true,
        message: `Manutenção concluída. Corrigidos: ${fixed}, Erros: ${errors}`,
        fixed,
        errors
      });
      
    } catch (error) {
      logger.error('[FIX] Erro na manutenção:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });