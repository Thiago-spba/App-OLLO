// ARQUIVO: functions/src/index.ts
// Design Dark Mode

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Inicialização do Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- CONFIGURAÇÃO SMTP (Lendo do .env) ---
const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD
    }
});

// Configurações do Site
const APP_URL = "https://olloapp.com.br"; 
const DOMAIN_TO_REPLACE = "olloapp-egl2025.web.app"; 

const actionCodeSettings = {
   url: `${APP_URL}/login`, 
   handleCodeInApp: false,
};

// --- IMAGENS ---
const IMG_LOGO = `${APP_URL}/images/logo_ollo.jpeg`;
const IMG_EYES = `${APP_URL}/images/android-chrome-512x512.png`;

// --- TEMPLATE DE E-MAIL (DESIGN DARK MODE - Igual ao Print) ---
// Fundo escuro (#111827), Card escuro (#1f2937) com borda verde no topo.
const getOlloHtmlTemplate = (title: string, messageHtml: string, buttonText: string, link: string, footerNote?: string) => {       
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    
    <div style="max-width: 500px; margin: 40px auto; background: #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border-top: 4px solid #10b981;">

        <div style="background-color: #1f2937; padding: 40px 0 20px 0; text-align: center;">
            <img src="${IMG_LOGO}" alt="OLLO" style="width: 90px; height: 90px; display: block; margin: 0 auto; border-radius: 50%; border: 2px solid #374151; object-fit: cover;">
        </div>

        <div style="padding: 0 40px 40px 40px; text-align: center;">
            
            <h2 style="color: #f9fafb; font-size: 24px; margin: 0 0 10px 0; font-weight: 700;">
                ${title}
            </h2>

            <p style="color: #fbbf24; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 30px 0;">
                EXPLORE. CONECTE. NEGOCIE.
            </p>
            
            <div style="font-size: 16px; color: #d1d5db; line-height: 1.6; margin-bottom: 30px;">
                ${messageHtml}
            </div>

            <div style="margin-bottom: 30px;">
                <img src="${IMG_EYES}" alt="OLLO Eyes" style="width: 100px; height: auto;">
            </div>

            <div style="margin-bottom: 30px;">
                <a href="${link}"
                    style="display: inline-block; background-color: #047857; color: #ffffff !important; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
                    ${buttonText}
                </a>
            </div>

            <div style="border-top: 1px solid #374151; padding-top: 20px; margin-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin-top: 5px;">
                    Equipe OLLO &bull; Segurança em primeiro lugar
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

// ==========================================
// 1. GATILHO: NOVO USUÁRIO (Corrigido para usar Nome)
// ==========================================
export const onnewusercreated = functions.region("southamerica-east1").auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    const { uid, email, displayName } = user;
    const nameToUse = displayName || "Viajante";

    try {
        // Cria docs no Firestore
        await db.runTransaction(async (t) => {
            t.set(db.collection("users").doc(uid), {
                email, displayName: nameToUse, createdAt: admin.firestore.FieldValue.serverTimestamp(), profileCreated: true
            });
            let base = email ? email.split("@")[0] : `user${uid.substring(0, 5)}`;
            base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const username = `${base}${Date.now().toString().slice(-4)}`;

            t.set(db.collection("users_public").doc(uid), {
                userId: uid, name: nameToUse, username: username, verified: false
            });
        });

        if (email) {
            let link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
            link = link.replace(DOMAIN_TO_REPLACE, "olloapp.com.br");

            // CORREÇÃO: Pega o primeiro nome para não chamar de "Viajante" se tiver nome disponível
            const firstName = nameToUse.split(' ')[0];
            
            const message = "Sua conta é a chave para um universo completo.<br>Confirme seu acesso abaixo e descubra uma nova forma de interagir.";
            const html = getOlloHtmlTemplate(`Olá, ${firstName}!`, message, "Confirmar meu E-mail", link);
            
            await transporter.sendMail({
                from: '"OLLO Oficial" <contato@olloapp.com.br>',
                to: email,
                subject: "Bem-vindo ao OLLO! Confirme sua conta",
                html: html
            });
        }
    } catch (e) { console.error("Erro no cadastro:", e); }
});

// ==========================================
// 2. FUNÇÃO: RESET DE SENHA (Design Atualizado)
// ==========================================
export const sendBrevoPasswordResetEmail = functions.region("southamerica-east1").https.onCall(async (data: any, context: functions.https.CallableContext) => {
    const { email } = data;
    if (!email) throw new functions.https.HttpsError("invalid-argument", "E-mail obrigatório.");

    try {
        let userName = "Viajante";
        try {
            // Tenta pegar o nome mais atualizado possível
            const userRecord = await admin.auth().getUserByEmail(email);
            if (userRecord.displayName) userName = userRecord.displayName;
            else {
                const userQuery = await db.collection("users").where("email", "==", email).limit(1).get();
                if (!userQuery.empty) userName = userQuery.docs[0].data().displayName || "Viajante";
            }
        } catch (e) { console.log("Erro ao buscar nome."); }

        const firstName = userName.split(' ')[0];
        let link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
        link = link.replace(DOMAIN_TO_REPLACE, "olloapp.com.br");

        const message = "Recebemos um pedido para alterar sua senha.<br>Se não foi você, ignore este e-mail.";
        const html = getOlloHtmlTemplate(`Recuperar Acesso`, `Olá, ${firstName}.<br>${message}`, "Redefinir Senha", link);

        await transporter.sendMail({
            from: '"Suporte OLLO" <contato@olloapp.com.br>',
            to: email,
            subject: "Recuperar Senha - OLLO",
            html: html
        });

        return { success: true };
    } catch (error: any) { 
        console.error("Erro no envio:", error);
        throw new functions.https.HttpsError("internal", "Erro ao enviar e-mail."); 
    }
});

// 3. AUXILIARES
export const onUserDelete = functions.region("southamerica-east1").auth.user().onDelete(async (user: admin.auth.UserRecord) => {
    await db.collection("users").doc(user.uid).delete();
    await db.collection("users_public").doc(user.uid).delete();
});

export const updateEmailVerificationStatus = functions.region("southamerica-east1").https.onCall(async (data: any, context: functions.https.CallableContext) => {  
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Negado");
    await db.collection("users").doc(context.auth.uid).update({ emailVerified: true });
    await db.collection("users_public").doc(context.auth.uid).update({ verified: true });
    return { success: true };
});