// src/services/firestoreService.js

import { db } from '../firebase/config';
import {
  collection,
  query,
  where, // Adicionado para a nova função
  orderBy,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  setDoc, // Adicionado para a criação de perfil
  serverTimestamp, // Adicionado para timestamps do servidor
} from 'firebase/firestore';

// ========================================================================
// FUNÇÕES RELACIONADAS A POSTS
// ========================================================================

/**
 * Busca dados de um usuário e os comentários de um post para "enriquecê-lo".
 * Esta função é o coração da nossa lógica de exibição de dados complexos.
 * @param {object} post - O objeto do post cru vindo do Firestore.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto do post enriquecido.
 */
export const enrichPostData = async (post) => {
  // Guarda de segurança para posts sem authorid
  if (!post.authorid) {
    console.warn(`Post com ID ${post.id} está sem authorid!`);
    return {
      ...post,
      userName: 'Autor Desconhecido',
      userAvatar: '/images/default-avatar.png',
      comments: [],
    };
  }

  // Buscar dados do autor
  const userDoc = await getDoc(doc(db, 'users', post.authorid));
  const userData = userDoc.exists()
    ? userDoc.data()
    : { name: 'Usuário Desconhecido', avatarUrl: '/images/default-avatar.png' };

  // Buscar comentários da subcoleção
  const commentsQuery = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
  const commentsSnapshot = await getDocs(commentsQuery);
  const commentsList = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Enriquecer cada comentário com os dados do seu autor
  const enrichedComments = await Promise.all(
    commentsList.map(async (comment) => {
      if (!comment.authorid) return { ...comment, userName: 'Anônimo' };
      const commentAuthorDoc = await getDoc(doc(db, 'users', comment.authorid));
      const authorData = commentAuthorDoc.exists()
        ? commentAuthorDoc.data()
        : { name: 'Anônimo', avatarUrl: '/images/default-avatar.png' };
      return { ...comment, userName: authorData.name, userAvatar: authorData.avatarUrl };
    })
  );

  return {
    ...post,
    userName: userData.name,
    userAvatar: userData.avatarUrl,
    comments: enrichedComments,
  };
};


/**
 * Busca todos os posts de um usuário específico.
 * @param {string} userId - O UID do usuário cujos posts serão buscados.
 * @returns {Promise<Array<object>>} Uma lista dos posts do usuário.
 */
export const getPostsByUserId = async (userId) => {
  // NOTA: Esta consulta requer um índice composto no Firestore. 
  // O Firebase geralmente fornecerá um link no console de erro para criá-lo com um clique.
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where("authorid", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Adiciona ou remove o like de um usuário em um post.
 * @param {string} postId - O ID do post.
 * @param {string} userId - O ID do usuário que interage.
 * @returns {Promise<void>}
 */
export const togglePostLike = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) {
    throw new Error('Post não encontrado!');
  }
  
  const postData = postDoc.data();
  const updateAction = postData.likes.includes(userId) ? arrayRemove : arrayUnion;

  return updateDoc(postRef, {
    likes: updateAction(userId),
  });
};

/**
 * Deleta um post do Firestore.
 * @param {string} postId - O ID do post a ser deletado.
 * @returns {Promise<void>}
 */
export const deletePostById = (postId) => {
  const postRef = doc(db, 'posts', postId);
  return deleteDoc(postRef);
};


// ========================================================================
// FUNÇÕES RELACIONADAS A COMENTÁRIOS
// ========================================================================

/**
 * Adiciona um novo comentário a um post.
 * @param {string} postId - O ID do post a ser comentado.
 * @param {object} commentData - O objeto do comentário ({ authorid, text, createdAt }).
 * @returns {Promise<void>}
 */
export const addCommentToPost = (postId, commentData) => {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  return addDoc(commentsCollectionRef, commentData);
};


// ========================================================================
// FUNÇÕES RELACIONADAS A USUÁRIOS
// ========================================================================

/**
 * Cria um documento de perfil para um novo usuário na coleção 'users'.
 * @param {string} uid - O UID do usuário vindo da Autenticação.
 * @param {object} profileData - Os dados do perfil (ex: { name, email }).
 * @returns {Promise<void>}
 */
export const createUserProfile = (uid, profileData) => {
  const userDocRef = doc(db, 'users', uid);
  return setDoc(userDocRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    isAdmin: false, // Novos usuários nunca são admins por padrão
  });
};

/**
 * Busca o perfil completo de um usuário do Firestore.
 * @param {string} uid - O UID do usuário a ser buscado.
 * @returns {Promise<object|null>} O perfil do usuário ou null se não encontrado.
 */
export const getUserProfile = async (uid) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
};

/**
 * Atualiza os dados do perfil de um usuário no Firestore.
 * @param {string} uid - O UID do usuário a ser atualizado.
 * @param {object} updatedData - Um objeto com os campos a serem atualizados.
 * @returns {Promise<void>}
 */
export const updateUserProfile = (uid, updatedData) => {
    const userDocRef = doc(db, 'users', uid);
    return updateDoc(userDocRef, {
        ...updatedData,
        updatedAt: serverTimestamp() // Adiciona um campo para rastrear a última atualização
    });
};