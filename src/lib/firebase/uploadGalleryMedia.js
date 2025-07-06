import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "@/firebase/config";

/**
 * Upload de mídias (imagens ou vídeos) para a galeria do usuário no Firebase Storage.
 * @param {File[]} files - Lista de arquivos a enviar.
 * @param {string} userId - UID do usuário autenticado.
 * @returns {Promise<Array<{ id: string, type: 'image' | 'video', url: string }>>}
 */
export const uploadGalleryMedia = async (files, userId) => {
  if (!userId) throw new Error("Usuário não autenticado ou ID inválido.");

  const uploadedItems = [];

  for (const file of files) {
    const id = uuidv4();
    const type = file.type.startsWith("image") ? "image" : "video";
    const fileRef = ref(storage, `media/${userId}/${id}_${file.name}`);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    uploadedItems.push({
      id,
      type,
      url,
    });
  }

  return uploadedItems;
};
