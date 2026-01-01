// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Inicializa o Firebase
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- CONFIGURAÇÃO DO ZOHO (SMTP) ---
const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: functions.config().smtp.email,
        pass: functions.config().smtp.password
    }
});

// Configuração do Link de Ação (Aponta para o manipulador do Google)
const actionCodeSettings = {
   url: "https://olloapp-egl2025.web.app",
    handleCodeInApp: false,
};

// --- 1. GATILHO AUTOMÁTICO (Criação + Envio) ---
export const onnewusercreated = functions.region("southamerica-east1").auth.user().onCreate(async (user: any) => {
    const { uid, email, displayName, emailVerified } = user;

    try {
        // A. Criação no Banco de Dados
        let base = email ? email.split("@")[0] : `user${uid.substring(0, 5)}`;
        base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const query = await db.collection("users_public").where("username", "==", base).get();
        const username = query.empty ? base : `${base}${Date.now().toString().slice(-4)}`;

        await db.runTransaction(async (t) => {
            const userRef = db.collection("users").doc(uid);
            const publicRef = db.collection("users_public").doc(uid);
            t.set(userRef, {
                email: email || "", displayName: displayName || "", createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(), emailVerified: emailVerified || false, profileCreated: true,
                lastVerificationEmailSent: admin.firestore.FieldValue.serverTimestamp()
            });
            t.set(publicRef, {
                userId: uid, name: displayName || "Usuário OLLO", username: username,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "O")}&background=0D4D44&color=fff&bold=true`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(), verified: emailVerified || false,
            });
        });

        // B. Envio Automático do E-mail
        if (email) {
            console.log(`Enviando e-mail automático para: ${email}`);
            const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #0D4D44; text-align: center;">Bem-vindo ao OLLO! 🚀</h2>
                    <p>Olá, <strong>${displayName || 'Usuário'}</strong>!</p>
                    <p>Para ativar sua conta com segurança, clique no botão abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #0D4D44; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Ativar Minha Conta</a>
                    </div>
                    <p style="font-size: 12px; color: #777; text-align: center;">Ou copie este link: <br><a href="${verificationLink}" style="color: #0D4D44;">${verificationLink}</a></p>
                </div>
            `;

            await transporter.sendMail({
                from: '"Equipe OLLO" <contato@olloapp.com.br>',
                to: email,
                subject: "Ative sua conta no OLLO ✔",
                html: htmlContent
            });
        }

    } catch (e) { console.error("Erro no onnewusercreated:", e); }
});

// --- 2. FUNÇÃO MANUAL (Reenvio) ---
export const sendBrevoVerificationEmail = functions.region("southamerica-east1").https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login necessário.");
    
    const { email, uid } = context.auth.token;
    const displayName = data.displayName || "Usuário";

    try {
        const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #0D4D44; text-align: center;">Reenvio de Verificação 🚀</h2>
                <p>Olá, <strong>${displayName}</strong>!</p>
                <p>Aqui está seu novo link de ativação:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #0D4D44; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Ativar Minha Conta</a>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: '"Equipe OLLO" <contato@olloapp.com.br>',
            to: email,
            subject: "Ative sua conta no OLLO (Reenvio)",
            html: htmlContent
        });

        await db.collection("users").doc(uid).set({ lastVerificationEmailSent: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        return { success: true };

    } catch (error: any) {
        console.error("Erro ao reenviar:", error);
        throw new functions.https.HttpsError("internal", "Falha ao enviar e-mail.");
    }
});

// --- 3. OUTRAS FUNÇÕES ---
export const onUserDelete = functions.region("southamerica-east1").auth.user().onDelete(async (user: any) => {
    try {
        await db.runTransaction(async (t) => {
            t.delete(db.collection("users").doc(user.uid));
            t.delete(db.collection("users_public").doc(user.uid));
        });
    } catch (e) { console.error(e); }
});

export const updateEmailVerificationStatus = functions.region("southamerica-east1").https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Negado");
    const uid = context.auth.uid;
    await db.runTransaction(async (t) => {
        t.update(db.collection("users").doc(uid), { emailVerified: true });
        const pubRef = db.collection("users_public").doc(uid);
        const docSnap = await t.get(pubRef);
        if (docSnap.exists) t.update(pubRef, { verified: true });
    });
    return { success: true };
});