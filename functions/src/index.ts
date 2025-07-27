import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// O pacote da Brevo não tem tipos, então usamos 'require'
const SibApiV3Sdk = require("@getbrevo/brevo");

admin.initializeApp();

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Não é mais necessário pegar a chave aqui, pegaremos dentro da função

/**
 * Função v1 acionada na criação de um novo usuário para enviar um e-mail de boas-vindas.
 */
export const sendWelcomeAndVerificationEmail = functions
  .runWith({ memory: '256MB', timeoutSeconds: 60 }) // <--- CORREÇÃO APLICADA
  .auth.user().onCreate(async (user) => {
    const userEmail = user.email;
    const displayName = user.displayName || "novo usuário";

    if (!userEmail) {
      console.log("Usuário criado sem e-mail, impossível enviar e-mail.");
      return;
    }

    try {
      // Pega a chave da API das variáveis de ambiente
      const brevoKey = functions.config().brevo.key;
      apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoKey);

      // 1. Gera o link de verificação de e-mail do Firebase
      const verificationLink = await admin.auth().generateEmailVerificationLink(userEmail);

      // 2. Seu HTML personalizado
      let emailHtmlContent = `
        <div style="background: linear-gradient(135deg, #a8edea 0%, #45c486 100%); min-height:100vh; padding:0; margin:0;">
          <div style="max-width: 480px; margin: 40px auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 36px #3dd6a333, 0 1px 2px #0001; padding: 40px 28px 28px 28px; font-family: Arial, sans-serif; border: 1.5px solid #a8edea;">
            <div style="display: flex; align-items: flex-start; gap: 18px; margin-bottom: 24px;">
              <img src="https://firebasestorage.googleapis.com/v0/b/ollo-app-e5224.firebasestorage.app/o/assets%2Flogo-olloapp.png?alt=media&token=85f61cc4-431a-4226-ac7e-5f7ce0931a29" alt="Ollo App Logo" style="width: 60px; height: auto; border-radius: 7px; display:block; margin-top:2px;">
              <div>
                <h2 style="color: #17925c; font-size: 20px; margin: 2px 0 8px 0; font-weight: bold; letter-spacing: 0.5px;">Ollo App te dá as boas-vindas!</h2>
                <div style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 0;">Sua jornada começa aqui, onde cada olhar faz a diferença.<br>Ollo App é um convite para enxergar oportunidades onde ninguém vê.<br>Ative sua conta confirmando seu e-mail e prepare-se para uma experiência única.</div>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <img src="https://firebasestorage.googleapis.com/v0/b/ollo-app-e5224.firebasestorage.app/o/assets%2Folloapp_verdes.png?alt=media&token=d4b074f4-dbb1-4072-833e-43b9ef5b36b7" alt="Olhinhos verdes Ollo App" style="width: 75px; max-width: 100%; height: auto;">
            </div>
            <div style="text-align: center; margin: 28px 0 8px 0;">
              <a href="%LINK%" style="display: inline-block; background: linear-gradient(90deg, #3fd08a 0%, #28c4c0 100%); color: #fff; padding: 17px 40px; border-radius: 13px; text-decoration: none; font-size: 18px; font-weight: 700; box-shadow: 0 2px 12px #22b97633; transition: background 0.2s;">Ativar minha conta</a>
            </div>
            <p style="text-align: center; color: #cc2222; font-size: 13px; margin-top: 30px; margin-bottom: 8px;">Se você não criou esta conta, ignore este e-mail.</p>
            <p style="text-align: center; color: #aaa; font-size: 12px; margin: 0;">Equipe OlloApp</p>
          </div>
        </div>
      `;

      // Substitui o placeholder %LINK% pelo link de verificação real
      emailHtmlContent = emailHtmlContent.replace('%LINK%', verificationLink);

      // 3. Monta o objeto do e-mail para a Brevo
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: userEmail, name: displayName }];
      sendSmtpEmail.sender = { email: "contato@olloapp.com.br", name: "Ollo App" };
      sendSmtpEmail.subject = "Bem-vindo ao Ollo App! Ative sua conta";
      sendSmtpEmail.htmlContent = emailHtmlContent;

      // 4. Envia o e-mail
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`E-mail de boas-vindas enviado com sucesso para ${userEmail}`);

    } catch (error) {
      console.error("Erro ao enviar e-mail de boas-vindas:", error);
    }
});

/**
 * Função v1 agendada para rodar a cada hora.
 */
export const deleteExpiredStories = functions
  .runWith({ memory: '128MB', timeoutSeconds: 60 }) // <--- CORREÇÃO APLICADA
  .pubsub.schedule('every 1 hours').onRun(async (context) => {
    console.log('Executando a função agendada para deletar stories expirados...');
    // ... lógica da função agendada
    return null;
});