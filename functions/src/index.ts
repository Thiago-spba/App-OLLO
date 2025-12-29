import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";
import { logger } from "firebase-functions";
import * as Brevo from "@getbrevo/brevo";

admin.initializeApp();

// ===================================================================================
// 🎯 1. CONFIGURAÇÃO E CHAVES
// ===================================================================================
const BREVO_KEY_FALLBACK = "xkeysib-104d12d7044aa1f2d911f6b5a0699cf7f83aace7855f56e972c6be68875de76f";

const initBrevoApi = () => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  const apiKey = process.env.BREVO_API_KEY || BREVO_KEY_FALLBACK;
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return apiInstance;
};

const SENDER_INFO = {
  name: "Equipe OLLO",
  email: "noreply@olloapp.com.br"
};

// ===================================================================================
// 🛠️ 2. HELPERS (Formatação de Nome e Template de Email)
// ===================================================================================

// Formata o nome para não ficar vazio ou "Usuário"
const formatDisplayName = (displayName: string | undefined, email: string | undefined) => {
  if (displayName && displayName.trim() !== "" && displayName !== "Usuário") {
    return displayName;
  }
  if (email) {
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  return "Membro OLLO";
};

// Template visual
const getEmailTemplate = (title: string, name: string, bodyText: string, buttonText: string, link: string) => {
  const logoUrl = "https://ui-avatars.com/api/?name=OLLO&background=0D4D44&color=fff&size=128&length=4&font-size=0.33&bold=true";
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              
              <tr>
                <td align="center" style="padding: 40px 20px 10px 20px; background-color: #ffffff;">
                   <img src="${logoUrl}" alt="OLLO" width="80" height="80" style="display: block; border: 0; border-radius: 12px;">
                </td>
              </tr>

              <tr>
                <td style="padding: 20px 40px; text-align: center;">
                  <h2 style="color: #17925c; margin-bottom: 20px; font-size: 24px;">${title}</h2>
                  <p style="color: #555555; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                    Olá, <strong>${name}</strong>!<br><br>
                    ${bodyText}
                  </p>
                  
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="border-radius: 50px; background-color: #3fd08a;">
                        <a href="${link}" target="_blank" style="font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; display: inline-block; border: 1px solid #3fd08a; font-family: Arial, sans-serif;">
                          ${buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #999; font-size: 13px; margin-top: 25px;">
                    💡 <strong>Dica:</strong> Após ver a confirmação, volte para o aplicativo OLLO e clique em "Já verifiquei meu e-mail".
                  </p>
                  
                </td>
              </tr>

              <tr>
                <td style="padding: 30px; text-align: center; font-size: 12px; color: #999999;">
                  <p style="margin: 0;">Equipe OLLO</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// ===================================================================================
// 📧 3. FUNÇÃO DE VERIFICAÇÃO (Com Texto Explicativo)
// ===================================================================================
export const sendBrevoVerificationEmail = functions
  .region("southamerica-east1")
  .runWith({ secrets: ["BREVO_API_KEY"], timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login necessário');
    const { uid, email } = context.auth.token;
    if (!email) throw new functions.https.HttpsError('invalid-argument', 'Sem email');

    const rawName = data.displayName || context.auth.token.name;
    const finalName = formatDisplayName(rawName, email);

    logger.info(`[VERIFICAÇÃO] Enviando para: ${email} (${finalName})`);

    try {
      const db = getFirestore();
      
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const lastSent = userDoc.data()?.lastVerificationEmailSent?.toDate();
        if (lastSent && (Date.now() - lastSent.getTime() < 60000)) {
          throw new functions.https.HttpsError('resource-exhausted', `Aguarde um minuto.`);
        }
      }

      const verificationLink = await admin.auth().generateEmailVerificationLink(email);
      
      await db.collection("users").doc(uid).update({ lastVerificationEmailSent: FieldValue.serverTimestamp() });
      
      const apiInstance = initBrevoApi();
      const sendSmtpEmail = new Brevo.SendSmtpEmail();

      sendSmtpEmail.subject = "🔐 Ative sua conta no OLLO";
      sendSmtpEmail.sender = SENDER_INFO;
      sendSmtpEmail.to = [{ email: email, name: finalName }];
      
      // AQUI ESTÁ A MUDANÇA: Texto educativo e claro.
      sendSmtpEmail.htmlContent = getEmailTemplate(
        "Verifique seu email",
        finalName,
        "Falta pouco! Clique no botão abaixo para confirmar seu cadastro.<br><br><strong>Importante:</strong> Após confirmar, volte para o site do OLLO e atualize a página.",
        "Verificar Agora",
        verificationLink
      );

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      return { success: true };

    } catch (error: any) {
      logger.error(`[VERIFICAÇÃO] Erro:`, error);
      throw new functions.https.HttpsError('internal', 'Erro no envio');
    }
  });

// ===================================================================================
// 📧 4. FUNÇÃO DE BOAS-VINDAS
// ===================================================================================
async function sendWelcomeEmail(user: admin.auth.UserRecord): Promise<void> {
  if (!user.email) return;
  const db = getFirestore();
  
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists && userDoc.data()?.welcomeEmailSent) return;

    const apiInstance = initBrevoApi();
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    const finalName = formatDisplayName(user.displayName, user.email);

    sendSmtpEmail.subject = "🎉 Bem-vindo(a) ao OLLO!";
    sendSmtpEmail.sender = SENDER_INFO;
    sendSmtpEmail.to = [{ email: user.email, name: finalName }];
    
    sendSmtpEmail.htmlContent = getEmailTemplate(
      "Bem-vindo ao OLLO!",
      finalName,
      "Sua jornada começa aqui. Estamos muito felizes em ter você conosco.",
      "Acessar OLLO",
      "https://olloapp.com.br"
    );
    
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
// 👤 5. TRIGGER NOVO USUÁRIO
// ===================================================================================
export const onnewusercreated = functions
  .region("southamerica-east1")
  .runWith({ secrets: ["BREVO_API_KEY"], timeoutSeconds: 60 })
  .auth.user().onCreate(async (user) => {
    const { uid, email, displayName, emailVerified } = user;
    const db = getFirestore();
    try {
      const { privateExists, publicExists } = await userDocumentsExist(uid);
      if (privateExists && publicExists) {
        if (email && !emailVerified) await sendWelcomeEmail(user);
        return;
      }
      
      const username = await generateUniqueUsername(email, uid);
      await db.runTransaction(async (t) => {
        const userRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        const [uDoc, pDoc] = await Promise.all([t.get(userRef), t.get(publicRef)]);
        
        if (!uDoc.exists) t.set(userRef, {
          email: email || "",
          displayName: displayName || "",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          emailVerified: emailVerified || false,
          profileCreated: true,
          lastVerificationEmailSent: null
        });
        
        if (!pDoc.exists) t.set(publicRef, {
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
      });
      
      if (email) await sendWelcomeEmail(user);
    } catch (error) {
      logger.error(`[NOVO USUÁRIO] ERRO:`, error);
    }
  });

// ===================================================================================
// 🔧 6. HELPERS GERAIS (Mantidos)
// ===================================================================================
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

async function userDocumentsExist(uid: string): Promise<{ privateExists: boolean; publicExists: boolean; }> {
  const db = getFirestore();
  const [privateDoc, publicDoc] = await Promise.all([
    db.collection("users").doc(uid).get(),
    db.collection("users_public").doc(uid).get()
  ]);
  return { privateExists: privateDoc.exists, publicExists: publicDoc.exists };
}

export const onUserDelete = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 30 })
  .auth.user().onDelete(async (user) => {
    const { uid } = user;
    const db = getFirestore();
    try {
      await db.runTransaction(async (t) => {
        const privateRef = db.collection("users").doc(uid);
        const publicRef = db.collection("users_public").doc(uid);
        const [p1, p2] = await Promise.all([t.get(privateRef), t.get(publicRef)]);
        if (p1.exists) t.delete(privateRef);
        if (p2.exists) t.delete(publicRef);
      });
    } catch (error) { logger.error(`[EXCLUSÃO] Erro:`, error); }
  });

export const updateEmailVerificationStatus = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 30 })
  .https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Erro');
    const { uid } = context.auth;
    const db = getFirestore();
    await db.runTransaction(async (t) => {
      const privateRef = db.collection("users").doc(uid);
      const publicRef = db.collection("users_public").doc(uid);
      const [p1, p2] = await Promise.all([t.get(privateRef), t.get(publicRef)]);
      if (p1.exists) t.update(privateRef, { emailVerified: true, updatedAt: FieldValue.serverTimestamp() });
      if (p2.exists) t.update(publicRef, { verified: true });
    });
    return { success: true };
  });

export const fixExistingProfiles = functions
  .region("southamerica-east1")
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    const authToken = req.headers.authorization;
    if (authToken !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
      res.status(401).send('Unauthorized');
      return;
    }
    const db = getFirestore();
    let fixed = 0; let errors = 0;
    try {
      const listUsersResult = await admin.auth().listUsers(1000);
      for (const user of listUsersResult.users) {
        try {
          const { privateExists, publicExists } = await userDocumentsExist(user.uid);
          if (!privateExists || !publicExists) {
            const username = await generateUniqueUsername(user.email, user.uid);
            await db.runTransaction(async (t) => {
              const privateRef = db.collection("users").doc(user.uid);
              const publicRef = db.collection("users_public").doc(user.uid);
              if (!privateExists) t.set(privateRef, {
                email: user.email || "", displayName: user.displayName || "", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), emailVerified: user.emailVerified || false, profileCreated: true, fixedByMaintenance: true
              });
              if (!publicExists) t.set(publicRef, {
                userId: user.uid, name: user.displayName || "Usuário OLLO", username: username, avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'O')}&background=0D4D44&color=fff&bold=true`, bio: "Membro da comunidade OLLO", createdAt: FieldValue.serverTimestamp(), postsCount: 0, followersCount: 0, followingCount: 0, verified: user.emailVerified || false, fixedByMaintenance: true
              });
            });
            fixed++;
          }
        } catch (error) { logger.error(`[FIX] Erro:`, error); errors++; }
      }
      res.json({ success: true, fixed, errors });
    } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
  });