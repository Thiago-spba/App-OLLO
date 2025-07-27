// ARQUIVO: functions/index.js (Versão Final com as DUAS funções)

// --- IMPORTAÇÕES ---
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const SibApiV3Sdk = require("@getbrevo/brevo");
const { onSchedule } = require("firebase-functions/v2/scheduler");

// --- INICIALIZAÇÃO DO FIREBASE (só precisa de uma) ---
admin.initializeApp();

// ======================================================================
// FUNÇÃO 1: Envia e-mail de boas-vindas quando um novo usuário se cadastra
// ======================================================================
exports.sendWelcomeAndVerificationEmail = functions.auth.user().onCreate(async (user) => {
  const { email, uid, displayName } = user;

  const BREVO_API_KEY = functions.config().brevo.key;

  if (!email) {
    console.log(`Usuário ${uid} criado sem e-mail. Pulando envio.`);
    return null;
  }

  try {
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    const emailHtml = getVerificationEmailTemplate(verificationLink, displayName || "");

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.apiClient.authentications["api-key"].apiKey = BREVO_API_KEY;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Bem-vindo(a) à OLLO! Confirme seu e-mail";
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.sender = { "name": "Equipe OLLO", "email": "nao-responda@olloapp.com.br" };
    sendSmtpEmail.to = [{ "email": email, "name": displayName }];
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`E-mail de verificação enviado para ${email} via Brevo com sucesso.`);
    return null;
  } catch (error) {
    console.error(`Falha ao enviar e-mail para ${email} via Brevo. Erro:`, error);
    return null;
  }
});

// --- Função que ajuda a montar o corpo do e-mail ---
function getVerificationEmailTemplate(verificationLink, displayName) {
  const template = `
    <!DOCTYPE html>
    <html lang="pt-br"><head><meta charset="UTF-8"><title>Bem-vindo(a) ao Ollo App!</title></head>
    <body style="background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height:100vh; margin:0; padding:0;">
      <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; font-family: Arial, sans-serif; border: 1.5px solid #a8edea;">
        <div style="display: flex; align-items: flex-start; gap: 18px; margin-bottom: 24px;">
          <img src="https://firebasestorage.googleapis.com/v0/b/ollo-app-e5224.firebasestorage.app/o/assets%2Flogo-olloapp.png?alt=media&token=85f61cc4-431a-4226-ac7e-5f7ce0931a29" alt="Ollo App Logo" style="width: 60px; height: auto; border-radius: 7px; display:block; margin-top:2px;">
          <div>
            <h2 style="color: #17925c; font-size: 20px; margin: 2px 0 8px 0; font-weight: bold; letter-spacing: 0.5px;">Seja bem-vindo(a), %DISPLAY_NAME%!</h2>
            <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 0;">Estamos muito felizes por ter você a bordo.<br>Clique no botão abaixo para verificar seu endereço de e-mail e começar a explorar tudo o que o Ollo App oferece.</div>
          </div>
        </div>
        <div style="text-align: center; margin: 30px 0 20px 0;"><img src="https://firebasestorage.googleapis.com/v0/b/ollo-app-e5224.firebasestorage.app/o/assets%2Folloapp_verdes.png?alt=media&token=d4b074f4-dbb1-4072-833e-43b9ef5b36b7" alt="Olhinhos verdes Ollo App" style="width: 75px; max-width: 100%; height: auto;"></div>
        <div style="text-align: center; margin: 28px 0 8px 0;"><a href="%VERIFICATION_LINK%" style="display: inline-block; background: linear-gradient(90deg, #3fd08a 0%, #28c4c0 100%); color: #fff; padding: 17px 40px; border-radius: 13px; text-decoration: none; font-size: 18px; font-weight: 700; box-shadow: 0 2px 12px #22b97633; transition: background 0.2s;">Confirmar meu E-mail</a></div>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 30px; margin-bottom: 8px;">Se você não criou esta conta, por favor ignore este e-mail.</p>
        <p style="text-align: center; color: #aaa; font-size: 12px; margin: 0;">Equipe OlloApp</p>
      </div>
    </body></html>
  `;
  return template.replace('%VERIFICATION_LINK%', verificationLink).replace('%DISPLAY_NAME%', displayName || 'Usuário');
}


// ======================================================================
// FUNÇÃO 2: Deleta stories expirados a cada 1 hora
// ======================================================================
exports.deleteExpiredStories = onSchedule("every 1 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();
  const expiredStories = await admin.firestore().collection('stories').where('expiresAt', '<=', now).get();

  if (expiredStories.empty) {
    console.log('Nenhum story expirado encontrado.');
    return null;
  }

  const batch = admin.firestore().batch();
  const filesToDelete = [];
  expiredStories.forEach(doc => {
    batch.delete(doc.ref);
    const data = doc.data();
    if (data.mediaUrl && data.mediaUrl.includes('/stories/')) {
      try {
        const filePath = decodeURIComponent(data.mediaUrl.split('/o/')[1].split('?')[0]);
        filesToDelete.push(filePath);
      } catch (e) { /* ignora erro de path */ }
    }
  });

  await batch.commit();
  console.log(`Deletados ${expiredStories.size} stories do Firestore.`);

  const bucket = admin.storage().bucket();
  for (const filePath of filesToDelete) {
    try {
      await bucket.file(filePath).delete();
      console.log(`Arquivo deletado: ${filePath}`);
    } catch (err) {
      console.warn(`Erro ao deletar arquivo ${filePath}:`, err.message);
    }
  }

  return null;
});

// A função helloWorld que estava causando a confusão pode ser removida ou comentada.
// Se você não precisa dela, pode apagar esta linha:
// exports.helloWorld = ...