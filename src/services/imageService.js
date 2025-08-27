// src/services/imageService.js
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Verifica o tipo e tamanho do arquivo
 * @param {File} file - O arquivo a ser verificado
 * @param {Array} allowedTypes - Array de tipos MIME permitidos
 * @param {Number} maxSizeMB - Tamanho máximo em MB
 * @returns {Object} Resultado da validação
 */
export const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, message: 'Arquivo não fornecido' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}` 
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      message: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB` 
    };
  }

  return { isValid: true };
};

/**
 * Faz upload de uma imagem para o Firebase Storage com tratamento de progresso
 * @param {File} file - Arquivo a ser enviado
 * @param {String} path - Caminho no Storage
 * @param {Function} progressCallback - Callback para atualizar progresso
 * @returns {Promise<String>} URL do arquivo enviado
 */
export const uploadImage = (file, path, progressCallback = () => {}) => {
  return new Promise((resolve, reject) => {
    // Validação inicial
    const validation = validateFile(file);
    if (!validation.isValid) {
      reject(new Error(validation.message));
      return;
    }

    // Cria um nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullPath = `${path}/${fileName}`;
    
    // Cria referência ao arquivo
    const storageRef = ref(storage, fullPath);
    
    // Adiciona metadados importantes para segurança
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        ownerId: localStorage.getItem('userId') || 'anonymous', // Para regras de segurança
        uploadDate: new Date().toISOString()
      }
    };
    
    // Inicia o upload
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Monitora progresso e eventos
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressCallback(progress);
      },
      (error) => {
        // Tratamento de erro específico para diferentes códigos
        let errorMessage = 'Erro ao fazer upload da imagem';
        
        if (error.code === 'storage/unauthorized') {
          errorMessage = 'Você não tem permissão para fazer upload';
        } else if (error.code === 'storage/canceled') {
          errorMessage = 'Upload cancelado';
        } else if (error.code === 'storage/unknown') {
          errorMessage = 'Ocorreu um erro desconhecido';
        }
        
        reject(new Error(errorMessage));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Exclui uma imagem do Firebase Storage
 * @param {String} url - URL completa da imagem
 * @returns {Promise<void>}
 */
export const deleteImage = async (url) => {
  try {
    // Extrai o caminho do arquivo da URL
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('URL inválida para exclusão');
    }
    
    const filePath = decodedUrl.substring(startIndex, endIndex);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    throw error;
  }
};
