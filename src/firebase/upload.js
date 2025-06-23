import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./index"; // importa o storage do index.js

/**
 * Faz upload de um arquivo (imagem, vídeo, etc) para o Firebase Storage.
 * Retorna a URL pública de acesso ao arquivo.
 * 
 * @param {File} file - Arquivo JS (File API) selecionado pelo usuário
 * @param {string} pathPrefix - Subpasta do Storage (ex: "avatars", "gallery")
 * @returns {Promise<string>} - URL pública do Firebase Storage
 */
export async function uploadFileToFirebase(file, pathPrefix = "gallery") {
  // Extrai a extensão do arquivo (jpg, png, mp4 etc)
  const ext = file.name.split('.').pop();
  // Cria referência única no Storage (evita sobrescrever arquivos)
  const fileRef = ref(
    storage,
    `${pathPrefix}/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${ext}`
  );
  // Faz o upload do arquivo
  await uploadBytes(fileRef, file);
  // Retorna a URL pública de download
  return await getDownloadURL(fileRef);
}
