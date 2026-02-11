// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- CONFIGURAÇÃO SMTP (ZOHO) ---
const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: functions.config().smtp.email,
        pass: functions.config().smtp.password
    }
});

const actionCodeSettings = {
   url: "https://olloapp-egl2025.web.app", 
   handleCodeInApp: false,
};

// --- CONFIGURAÇÃO DE IMAGENS (YAHOO COMPATÍVEL) ---
const brand = {
    color: "#0D4D44",
    paper: "#FFFCF5",
    text: "#1f2937",
    // URLs públicas do seu site para evitar bloqueio no Yahoo
    logo: "https://olloapp-egl2025.web.app/images/android-chrome-512x512.png",
    eyes: "https://olloapp-egl2025.web.app/images/default-avatar.png" 
};

// --- TEMPLATE DE E-MAIL PERSONALIZADO ---
const getUniversalTemplate = (title: string, message: string, buttonText: string, link: string, userName: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <center>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 20px;">
                <tr>
                    <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${brand.paper}; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
                            <tr>
                                <td align="center" style="background-color: ${brand.color}; padding: 30px;">
                                    <img src="${brand.logo}" alt="OLLO" width="80" style="display: block; border: 0;">
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 40px 30px;">
                                    <h1 style="color: ${brand.color}; font-size: 24px; margin: 0 0 10px 0;">Olá, ${userName}!</h1>
                                    <p style="color: #d97706; font-size: 12px; text-transform: uppercase; font-weight: bold; margin: 0 0 20px 0;">${title}</p>
                                    <p style="color: ${brand.text}; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">${message}</p>
                                    <table border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="center" bgcolor="${brand.color}" style="border-radius: 50px;">
                                                <a href="${link}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 18px 45px; display: inline-block;">${buttonText}</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <div style="margin-top: 30px;"><img src="${brand.eyes}" alt="OLLO" width="60"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>`;
};

// 1. GATILHO DE NOVO USUÁRIO (Cria docs no banco e envia Boas-vindas)
export const onnewusercreated = functions.region("southamerica-east1").auth.user().onCreate(async (user) => {
    const { uid, email, displayName } = user;
    const nameToUse = displayName || "Viajante";

    try {
        // Lógica de Banco de Dados (Mantendo o que funcionava)
        let base = email ? email.split("@")[0] : `user${uid.substring(0, 5)}`;
        base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const username = `${base}${Date.now().toString().slice(-4)}`;

        await db.runTransaction(async (t) => {
            t.set(db.collection("users").doc(uid), {
                email, displayName: nameToUse, createdAt: admin.firestore.FieldValue.serverTimestamp(), profileCreated: true
            });
            t.set(db.collection("users_public").doc(uid), {
                userId: uid, name: nameToUse, username: username, verified: false
            });
        });

        // Envio do E-mail Personalizado
        const link = await admin.auth().generateEmailVerificationLink(email!, actionCodeSettings);
        const html = getUniversalTemplate("CONFIRME SUA CONTA", "Sua conta é a chave para um universo completo. Confirme seu acesso abaixo.", "Ativar Minha Conta", link, nameToUse);
        
        await transporter.sendMail({
            from: '"OLLO Oficial" <contato@olloapp.com.br>',
            to: email,
            subject: "Bem-vindo ao OLLO! Confirme seu e-mail",
            html: html
        });
    } catch (e) { console.error("Erro no cadastro:", e); }
});

// 2. RECUPERAÇÃO DE SENHA (Resolvendo Erro Internal e Personalizando Nome)
export const sendPasswordResetEmail = functions.region("southamerica-east1").https.onCall(async (data) => {
    const { email } = data;
    if (!email) throw new functions.https.HttpsError("invalid-argument", "E-mail obrigatório.");

    try {
        const userDoc = await db.collection("users").where("email", "==", email).limit(1).get();
        const userName = userDoc.empty ? "Viajante" : (userDoc.docs[0].data().displayName || "Viajante");

        const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
        const html = getUniversalTemplate("REDEFINIÇÃO DE SENHA", "Recebemos um pedido para alterar sua senha. Se não foi você, ignore este e-mail.", "Criar Nova Senha", link, userName);

        await transporter.sendMail({
            from: '"Suporte OLLO" <contato@olloapp.com.br>',
            to: email,
            subject: "Recuperar Senha - OLLO",
            html: html
        });
        return { success: true };
    } catch (error: any) { throw new functions.https.HttpsError("internal", error.message); }
});

// Outras funções necessárias para o funcionamento do sistema
export const sendBrevoVerificationEmail = functions.region("southamerica-east1").https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login necessário.");
    const link = await admin.auth().generateEmailVerificationLink(context.auth.token.email!, actionCodeSettings);
    const html = getUniversalTemplate("REENVIO DE LINK", "Aqui está o seu link de ativação.", "Ativar Conta", link, context.auth.token.name || "Usuário");
    await transporter.sendMail({ from: '"OLLO" <contato@olloapp.com.br>', to: context.auth.token.email, subject: "Link de Acesso OLLO", html });
    return { success: true };
});

export const onUserDelete = functions.region("southamerica-east1").auth.user().onDelete(async (user) => {
    await db.collection("users").doc(user.uid).delete();
    await db.collection("users_public").doc(user.uid).delete();
});

export const updateEmailVerificationStatus = functions.region("southamerica-east1").https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Negado");
    await db.collection("users").doc(context.auth.uid).update({ emailVerified: true });
    await db.collection("users_public").doc(context.auth.uid).update({ verified: true });
    return { success: true };
});