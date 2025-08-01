// Localização: functions/src/index.ts
// VERSÃO FINAL 2.0: Corrigido e usando a sintaxe de Funções de 2ª Geração (v2)

import * as admin from "firebase-admin";

// Importações específicas para a 2ª Geração
import { onUserCreated, AuthEvent } from "firebase-functions/v2/auth"; // <--- Adicionado AuthEvent
import { setGlobalOptions } from "firebase-functions/v2";

// Importa o SDK da Brevo
import * as Brevo from "@getbrevo/brevo";

admin.initializeApp();

// Define a região e os secrets para todas as funções neste arquivo.
setGlobalOptions({ 
    region: "southamerica-east1", 
    secrets: ["BREVO_API_KEY"] 
});

// A sintaxe da 2ª Geração, com o tipo do evento definido para evitar erros
export const sendwelcomeemail = onUserCreated(async (event: AuthEvent) => {
    // Na V2, o objeto do usuário está dentro de "event.data".
    const user = event.data;

    if (!user.email) {
      console.log(`[V2] Usuário ${user.uid} foi criado sem e-mail.`);
      return;
    }

    console.log(`[V2] Iniciando envio para ${user.email}`);

    try {
        const apiInstance = new Brevo.TransactionalEmailsApi();
        const apiKeyAuth = apiInstance.apiClient.authentications["api-key"];

        // Na V2, o acesso ao secret é através de process.env. O '!' no final é uma asserção
        // de que sabemos que o valor não será nulo, pois o Firebase garante isso.
        apiKeyAuth.apiKey = process.env.BREVO_API_KEY!;

        const sendSmtpEmail = new Brevo.SendSmtpEmail({
            subject: "[OLLOAPP V2] Bem-vindo(a)!",
            htmlContent: `
              <html><body>
                <h1>Olá, ${user.displayName || "usuário"}!</h1>
                <p>Seja muito bem-vindo(a) à versão 2 do OLLOAPP. Estamos felizes em ter você aqui.</p>
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
        
        console.log(`[V2] Tentando enviar o e-mail via API da Brevo...`);
        const brevoResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[V2] E-mail de boas-vindas enviado com SUCESSO!`, { response: brevoResponse.body });

    } catch (error) {
        const errorDetails = error instanceof Error ? (error as any).response?.body || error.message : error;
        console.error(`[V2] !!! ERRO AO ENVIAR E-MAIL DE BOAS-VINDAS !!!`, {
            userId: user.uid,
            error: errorDetails,
        });
    }
});