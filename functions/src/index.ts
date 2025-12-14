import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";
import { logger } from "firebase-functions";
import * as Brevo from "@getbrevo/brevo";

admin.initializeApp();

// ===================================================================================
// 🎯 CONFIGURAÇÃO E CHAVES
// ===================================================================================
// Fallback para garantir que funcione mesmo sem variável de ambiente configurada agora
const BREVO_KEY_FALLBACK = "xkeysib-104d12d7044aa1f2d911f6b5a0699cf7f83aace7855f56e972c6be68875de76f";

const initBrevoApi = () => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKeyAuth = apiInstance.apiClient.authentications["api-key"];
  apiKeyAuth.apiKey = process.env.BREVO_API_KEY || BREVO_KEY_FALLBACK;
  return apiInstance;
};

const SENDER_INFO = {
  name: "Equipe OLLO",
  email: "noreply@olloapp.com.br"
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
// 📧 FUNÇÃO DE VERIFICAÇÃO DE EMAIL (CORRIGIDA E RENOMEADA)
// ===================================================================================
export const sendBrevoVerificationEmail = functions
  .region("southamerica-east1")
  .runWith({ 
    secrets: ["BREVO_API_KEY"],
    timeoutSeconds: 30
  })
  .https.onCall(async (data, context) => {
    // 1. Verificações de Segurança
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    const { uid, email } = context.auth.token;
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email não encontrado');
    }

    const displayName = data.displayName || context.auth.token.name || "Usuário";

    logger.info(`[VERIFICAÇÃO] Iniciando envio para: ${email}`);

    try {
      const db = getFirestore();
      
      // Validação de intervalo de envio (Spam protection)
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const lastEmailSent = userData?.lastVerificationEmailSent?.toDate();
        
        if (lastEmailSent) {
          const timeDiff = Date.now() - lastEmailSent.getTime();
          const minInterval = 60000; // 1 minuto
          
          if (timeDiff < minInterval) {
            throw new functions.https.HttpsError(
              'resource-exhausted', 
              `Aguarde ${Math.ceil((minInterval - timeDiff) / 1000)}s para reenviar.`
            );
          }
        }
      }

      // 2. Configuração do Link (Sem www para evitar bugs de certificado/rota)
      const actionCodeSettings = {
        url: 'https://olloapp.com.br/email-verified',
        handleCodeInApp: false,
      };

      const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
      
      // 3. Atualizar timestamp no banco
      await db.collection("users").doc(uid).update({
        lastVerificationEmailSent: FieldValue.serverTimestamp()
      });
      
      // 4. Preparar envio via Brevo
      const apiInstance = initBrevoApi();
      
      const sendSmtpEmail = new Brevo.SendSmtpEmail({
        subject: "🔐 Verifique seu email - OLLO",
        sender: SENDER_INFO,
        to: [{ email: email, name: displayName }],
        htmlContent: `
          <!DOCTYPE html>
          <html lang="pt-br">
          <head><meta charset="UTF-8"><title>Verificação de Email - OLLO</title></head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height: 100vh; font-family: Arial, sans-serif;">
              <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; border: 1.5px solid #a8edea;">

                  <div style="display: flex; align-items: flex-start; gap: 18px; margin-bottom: 24px;">
                      <img src="https://storage.googleapis.com/gweb-cloud-media-autogen/website-prd/images/20240728T105822-0/ollo_logo_new.png"
                          alt="OLLO Logo" style="width: 60px; height: auto; border-radius: 7px; display: block; margin-top: 2px;">
                      <div>
                          <h2 style="color: #17925c; font-size: 20px; margin: 2px 0 8px 0; font-weight: bold; letter-spacing: 0.5px;">
                              Verifique seu email!</h2>
                          <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 0;">
                              Olá, ${displayName}.<br>
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

                  <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px;">
                      Se você não criou esta conta, ignore este e-mail.<br>Equipe OLLO
                  </p>
              </div>
          </body>
          </html>
        `,
      });

      const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
      
      logger.info(`[VERIFICAÇÃO] Email enviado! ID: ${response.body?.messageId}`);

      return { 
        success: true, 
        message: "Email de verificação enviado com sucesso!" 
      };

    } catch (error: any) {
      logger.error(`[VERIFICAÇÃO] Erro fatal:`, error);
      
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
        }
      });
      
      logger.info(`[NOVO USUÁRIO] Perfis criados com sucesso para ${uid}`);
      
      if (email) {
        await sendWelcomeEmail(user);
      }
      
    } catch (error: any) {
      logger.error(`[NOVO USUÁRIO] ERRO:`, error);
    }
  });

// ===================================================================================
// 📧 FUNÇÃO AUXILIAR PARA ENVIAR EMAIL DE BOAS-VINDAS
// ===================================================================================
async function sendWelcomeEmail(user: admin.auth.UserRecord): Promise<void> {
  if (!user.email) return;

  const db = getFirestore();
  
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists && userDoc.data()?.welcomeEmailSent) {
      return;
    }

    const apiInstance = initBrevoApi();

    const sendSmtpEmail = new Brevo.SendSmtpEmail({
      subject: "🎉 Bem-vindo(a) ao OLLO!",
      sender: SENDER_INFO,
      to: [{ email: user.email, name: user.displayName || "Novo Usuário" }],
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head><meta charset="UTF-8"><title>Bem-vindo(a) ao OLLO!</title></head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height: 100vh; font-family: Arial, sans-serif;">
            <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; border: 1.5px solid #a8edea;">
                <h2 style="color: #17925c; text-align: center;">Bem-vindo(a), ${user.displayName || "usuário"}!</h2>
                <p style="text-align: center; color: #444;">Sua jornada começa aqui.</p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="https://olloapp.com.br" style="background: linear-gradient(90deg, #3fd08a 0%, #28c4c0 100%); color: #fff; padding: 17px 40px; border-radius: 13px; text-decoration: none; font-weight: bold;">Explorar OLLO</a>
                </div>
                <p style="text-align: center; color: #aaa; font-size: 12px;">Equipe OLLO</p>
            </div>
        </body>
        </html>
      `,
    });
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    await db.collection("users").doc(user.uid).update({
      welcomeEmailSent: true,
      welcomeEmailSentAt: FieldValue.serverTimestamp()
    });

  } catch (error) {
    logger.error(`[BOAS-VINDAS] ERRO:`, error);
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
    logger.info(`[EXCLUSÃO] Limpando dados de ${uid}`);
    const db = getFirestore();
    try {
      await db.runTransaction(async (transaction) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        const [p1, p2] = await Promise.all([transaction.get(privateRef), transaction.get(publicRef)]);
        if (p1.exists) transaction.delete(privateRef);
        if (p2.exists) transaction.delete(publicRef);
      });
    } catch (error) {
      logger.error(`[EXCLUSÃO] Erro:`, error);
    }
  });

// ===================================================================================
// 🔄 FUNÇÃO PARA ATUALIZAR STATUS DE VERIFICAÇÃO DE EMAIL
// ===================================================================================
export const updateEmailVerificationStatus = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Erro');
    const { uid } = context.auth;
    const db = getFirestore();
    
    await db.runTransaction(async (transaction) => {
      const privateRef = db.collection("users").doc(uid);
      const publicRef = db.collection("users_public").doc(uid);
      const [p1, p2] = await Promise.all([transaction.get(privateRef), transaction.get(publicRef)]);
      
      if (p1.exists) transaction.update(privateRef, { emailVerified: true, updatedAt: FieldValue.serverTimestamp() });
      if (p2.exists) transaction.update(publicRef, { verified: true });
    });
    
    return { success: true };
  });

// ===================================================================================
// 🔧 FUNÇÃO DE MANUTENÇÃO (RESTAURADA E COMPLETA)
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
      
    } catch (error: any) {
      logger.error('[FIX] Erro na manutenção:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro desconhecido'
      });
    }
  });