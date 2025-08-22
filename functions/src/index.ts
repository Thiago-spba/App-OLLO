// ARQUIVO ATUALIZADO: functions/src/index.ts
// Lógica de criação de perfil no Firestore integrada com o envio de e-mail.

import * as admin from "firebase-admin";
// ACRESCENTADO: Importamos o getFirestore para interagir com o banco de dados.
import { getFirestore } from "firebase-admin/firestore";

// Importações usando a API v1 do Firebase Functions
import * as functions from "firebase-functions/v1";
import { logger } from "firebase-functions"; // ACRESCENTADO: Usaremos o logger do Firebase.

// Importa o SDK da Brevo
import * as Brevo from "@getbrevo/brevo";

admin.initializeApp();

// Suas configurações globais, mantidas 100% intactas.
// MUDANÇA: Renomeamos a função para refletir suas novas responsabilidades.
export const onnewusercreated = functions
    .region("southamerica-east1")
    .runWith({ secrets: ["BREVO_API_KEY"] })
    .auth.user().onCreate(async (user) => {
    const { uid, email, displayName } = user;

    logger.info(`Novo gatilho para usuário: ${uid}, Email: ${email}`);

    // --- ACRESCENTADO: Bloco de Criação de Documentos no Firestore ---
    try {
        const db = getFirestore();
        const batch = db.batch();

        // 1. Documento na coleção privada 'users'
        const privateProfileRef = db.collection("users").doc(uid);
        const privateData = {
          email: email || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        batch.set(privateProfileRef, privateData);

        // 2. Documento na coleção pública 'users_public'
        const publicProfileRef = db.collection("users_public").doc(uid);
        const username = (email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, '') || `user${uid.substring(0, 5)}`).toLowerCase();
        const publicData = {
          name: displayName || "Usuário OLLO",
          username: username,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'O')}&background=0D4D44&color=fff&bold=true`,
          bio: "Novo na comunidade OLLO!",
        };
        batch.set(publicProfileRef, publicData);
        
        // 3. Executa as duas escritas de uma vez.
        await batch.commit();
        logger.info(`Documentos de perfil para o usuário ${uid} criados com sucesso.`);

    } catch (error) {
        logger.error(`!!! ERRO AO CRIAR DOCUMENTOS DE PERFIL para ${uid} !!!`, error);
    }
    // --- FIM DO BLOCO ACRESCENTADO ---


    // --- SEU CÓDIGO ORIGINAL: Bloco de Envio de E-mail (100% MANTIDO) ---
    if (!user.email) {
      logger.warn(`Usuário ${user.uid} foi criado sem e-mail, pulando envio.`);
      return;
    }

    logger.info(`Iniciando envio de e-mail de boas-vindas para ${user.email}`);

    try {
        const apiInstance = new Brevo.TransactionalEmailsApi();
        const apiKeyAuth = apiInstance.apiClient.authentications["api-key"];
        apiKeyAuth.apiKey = process.env.BREVO_API_KEY!;

        const sendSmtpEmail = new Brevo.SendSmtpEmail({
            subject: "[OLLOAPP] Bem-vindo(a)!",
            htmlContent: `
              <html><body>
                <h1>Olá, ${user.displayName || "usuário"}!</h1>
                <p>Seja muito bem-vindo(a) à OLLOAPP. Estamos felizes em ter você aqui.</p>
              </body></html>`,
            sender: { 
                name: "Equipe OLLOAPP", 
                email: "contato@olloapp.com.br"
            },
            to: [{ 
                email: user.email, 
                name: user.displayName || "Novo Usuário" 
            }],
        });
        
        const brevoResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
        logger.info(`E-mail de boas-vindas enviado com SUCESSO para ${user.email}!`, { response: brevoResponse.body });

    } catch (error) {
        const errorDetails = error instanceof Error ? (error as any).response?.body || error.message : error;
        logger.error(`!!! ERRO AO ENVIAR E-MAIL DE BOAS-VINDAS para ${user.email} !!!`, {
            userId: user.uid,
            error: errorDetails,
        });
    }
});