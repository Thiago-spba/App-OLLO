// ARQUIVO FINAL E COMPLETO: src/services/firestoreService.js
// Mantém todo o código original e adiciona a lógica de comentários.

import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  serverTimestamp,
  limit,
} from 'firebase/firestore';

// ========================================================================
// FUNÇÕES DE USUÁRIO - (SEU CÓDIGO ORIGINAL - INTACTO)
// ========================================================================

export const createUserProfile = async (uid, profileData) => {
  try {
    const privateProfileRef = doc(db, 'users', uid);
    const publicProfileRef = doc(db, 'users_public', uid);
    const batch = writeBatch(db);

    const username = profileData.username || `user_${uid.substring(0, 5)}`;

    const privateData = {
      email: profileData.email,
      isAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const publicData = {
      name: profileData.name || 'Usuário OLLO',
      username: username,
      avatarUrl: null,
      coverUrl: null,
      bio: '',
    };

    batch.set(privateProfileRef, privateData);
    batch.set(publicProfileRef, publicData);
    await batch.commit();

    return { id: uid, ...privateData, ...publicData };
  } catch (error) {
    console.error('[OLLO] Erro ao criar perfil de usuário:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const publicDocRef = doc(db, 'users_public', uid);
  const publicDocSnap = await getDoc(publicDocRef);
  if (!publicDocSnap.exists()) return null;
  return { id: uid, ...publicDocSnap.data() };
};

export const updateUserPublicProfile = (uid, updatedData) => {
  const publicProfileRef = doc(db, 'users_public', uid);
  return updateDoc(publicProfileRef, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

// ========================================================================
// FUNÇÕES DE POSTS - (SEU CÓDIGO ORIGINAL - INTACTO)
// ========================================================================

export const getFeedPosts = async () => {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(25));
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (posts.length === 0) return [];

  const authorIds = [...new Set(posts.map((post) => post.authorId).filter(Boolean))];

  if (authorIds.length === 0) {
    return posts.map(post => ({
        ...post,
        authorName: 'Usuário Desconhecido',
        authorAvatar: null
    }));
  }

  const authorsQuery = query(collection(db, 'users_public'), where('__name__', 'in', authorIds));
  const authorsSnapshot = await getDocs(authorsQuery);

  const authorsMap = new Map();
  authorsSnapshot.forEach((doc) => {
    authorsMap.set(doc.id, doc.data());
  });

  const enrichedPosts = posts.map((post) => {
    const authorData = authorsMap.get(post.authorId);
    return {
      ...post,
      authorName: authorData?.name || 'Usuário OLLO',
      authorAvatar: authorData?.avatarUrl || null,
    };
  });

  return enrichedPosts;
};

export const getPostsByUserId = async (userId) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where("authorId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const togglePostLike = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) throw new Error('Post não encontrado!');

  const postData = postDoc.data();
  const likes = postData.likes || [];
  const updateAction = likes.includes(userId) ? arrayRemove(userId) : arrayUnion(userId);
  
  return updateDoc(postRef, { likes: updateAction });
};

export const deletePostById = (postId) => {
  const postRef = doc(db, 'posts', postId);
  return deleteDoc(postRef);
};

export const enrichPostData = async (post) => {
    if (!post || !post.authorId) {
      return { ...post, authorName: 'Anônimo', authorAvatar: null };
    }
    const authorData = await getUserProfile(post.authorId);
    return {
        ...post,
        authorName: authorData?.name || 'Usuário Desconhecido',
        authorAvatar: authorData?.avatarUrl || null
    };
};

// ========================================================================
// MUDANÇA: NOVA SEÇÃO PARA FUNÇÕES DE COMENTÁRIOS
// ========================================================================

/**
 * Busca todos os comentários de um post específico, ordenados pelos mais recentes.
 * @param {string} postId - O ID do post cujos comentários serão buscados.
 * @returns {Promise<Array>} Uma lista de objetos de comentário.
 */
export const getCommentsForPost = async (postId) => {
  try {
    const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`[OLLO] Erro ao buscar comentários para o post ${postId}:`, error);
    return [];
  }
};

/**
 * Adiciona um novo comentário a um post.
 * @param {string} postId - O ID do post a ser comentado.
 * @param {string} commentText - O texto do comentário.
 * @param {object} authorData - O objeto denormalizado com { uid, displayName, photoURL }.
 * @returns {Promise<object>} O novo objeto de comentário criado, para atualização otimista da UI.
 */
// CORREÇÃO: Substituímos sua função 'addCommentToPost' original por esta versão aprimorada.
export const addCommentToPost = async (postId, commentText, authorData) => {
  try {
    const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
    const newCommentPayload = {
      text: commentText,
      author: authorData,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(commentsCollectionRef, newCommentPayload);
    return {
      id: docRef.id,
      ...newCommentPayload,
      createdAt: { toDate: () => new Date() }, 
    };
  } catch (error) {
    console.error(`[OLLO] Erro ao adicionar comentário ao post ${postId}:`, error);
    throw error;
  }
};