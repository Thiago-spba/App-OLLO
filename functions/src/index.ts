// functions/src/index.ts
import * as functions from "firebase-functions/v1"; // <--- CORREÇÃO: Importa V1 explicitamente
import * as admin from "firebase-admin";
import axios from "axios";

// Inicialização única
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- FUNÇÃO 1: Enviar E-mail (V1) ---
// Adicionado ': any' para resolver o erro de "implicitly has an 'any' type"
export const sendBrevoVerificationEmail = functions.region("southamerica-east1").https.onCall(async (data: any, context: any) => {
    // 1. Verificação de Segurança
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login necessário.");
    }

    // 2. Leitura da Chave
    const brevoKey = functions.config().brevo?.key;
    if (!brevoKey) {
        console.error("ERRO CRÍTICO: Chave 'brevo.key' não encontrada no functions.config()");
        throw new functions.https.HttpsError("internal", "Erro de configuração do servidor.");
    }

    const { email, uid } = context.auth.token;
    const displayName = data.displayName || "Usuário";

    if (!email) {
        throw new functions.https.HttpsError("invalid-argument", "Usuário sem e-mail.");
    }

    try {
        // 3. Gerar Link e Enviar
        const actionCodeSettings = {
            url: "https://olloapp.com.br/", 
            handleCodeInApp: false,
        };

        const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

        // Salva log no banco
        await db.collection("users").doc(uid).set(
            { lastVerificationEmailSent: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );

        // Envia via Brevo
        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { name: "Equipe OLLO", email: "no-reply@olloapp.com.br" },
                to: [{ email: email, name: displayName }],
                templateId: 1, 
                params: {
                    NOME: displayName,
                    LINK: verificationLink,
                    URL: verificationLink,
                },
            },
            {
                headers: {
                    "api-key": brevoKey,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        return { success: true };

    } catch (error: any) {
        console.error("Erro no envio de e-mail:", error.response?.data || error.message);
        throw new functions.https.HttpsError("internal", "Falha ao enviar e-mail via provedor.");
    }
});

// --- FUNÇÃO 2: Criar Usuário no Banco (V1) ---
export const onnewusercreated = functions.region("southamerica-east1").auth.user().onCreate(async (user: any) => {
    const { uid, email, displayName, emailVerified } = user;
    
    try {
        let base = email ? email.split("@")[0] : `user${uid.substring(0, 5)}`;
        base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        
        const query = await db.collection("users_public").where("username", "==", base).get();
        const username = query.empty ? base : `${base}${Date.now().toString().slice(-4)}`;

        await db.runTransaction(async (t) => {
            const userRef = db.collection("users").doc(uid);
            const publicRef = db.collection("users_public").doc(uid);

            t.set(userRef, {
                email: email || "",
                displayName: displayName || "",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                emailVerified: emailVerified || false,
                profileCreated: true,
            });

            t.set(publicRef, {
                userId: uid,
                name: displayName || "Usuário OLLO",
                username: username,
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "O")}&background=0D4D44&color=fff&bold=true`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                verified: emailVerified || false,
            });
        });
    } catch (e) {
        console.error("Erro ao criar usuário no banco:", e);
    }
});

// --- FUNÇÃO 3: Deletar Usuário (V1) ---
export const onUserDelete = functions.region("southamerica-east1").auth.user().onDelete(async (user: any) => {
    try {
        await db.runTransaction(async (t) => {
            t.delete(db.collection("users").doc(user.uid));
            t.delete(db.collection("users_public").doc(user.uid));
        });
    } catch (e) {
        console.error("Erro ao deletar usuário:", e);
    }
});

// --- FUNÇÃO 4: Atualizar Status (V1) ---
export const updateEmailVerificationStatus = functions.region("southamerica-east1").https.onCall(async (data: any, context: any) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Negado");
    const uid = context.auth.uid;
    
    await db.runTransaction(async (t) => {
        t.update(db.collection("users").doc(uid), { emailVerified: true });
        const pubRef = db.collection("users_public").doc(uid);
        const docSnap = await t.get(pubRef);
        if (docSnap.exists) {
            t.update(pubRef, { verified: true });
        }
    });
    return { success: true };
});