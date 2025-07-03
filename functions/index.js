const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
admin.initializeApp();

// Função programada para rodar a cada hora e deletar stories expirados
exports.deleteExpiredStories = onSchedule("every 1 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();

  // Buscar stories expirados (expiresAt <= agora)
  const expiredStories = await admin.firestore().collection('stories')
    .where('expiresAt', '<=', now)
    .get();

  if (expiredStories.empty) {
    console.log('Nenhum story expirado encontrado.');
    return null;
  }

  // Deletar todos os stories expirados (em batch)
  const batch = admin.firestore().batch();
  const filesToDelete = [];

  expiredStories.forEach(doc => {
    batch.delete(doc.ref);

    // (Opcional) Para deletar mídia do Storage:
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

  // (Opcional) Deleta arquivos do Storage também
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
