// ARQUIVO CORRIGIDO: src/services/firestoreService.js
// Mantém a performance e corrige a lógica de fallback do avatar.

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
// FUNÇÕES DE USUÁRIO
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
      // **A CORREÇÃO FUNDAMENTAL #1**
      // O avatar padrão é nulo. A UI decide o que mostrar.
      avatarUrl: null,
      coverUrl: null, // Também é bom padronizar isso.
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
// FUNÇÕES DE POSTS
// ========================================================================

/**
 * Busca posts do feed e os enriquece de forma eficiente,
 * passando `null` para avatares ausentes.
 */
export const getFeedPosts = async () => {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(25));
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (posts.length === 0) return [];

  // Padronizado para authorId (camelCase)
  const authorIds = [...new Set(posts.map((post) => post.authorId).filter(Boolean))];

  if (authorIds.length === 0) {
    return posts.map(post => ({
        ...post,
        authorName: 'Usuário Desconhecido',
        authorAvatar: null // Passa null se não houver autor
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

    // **A CORREÇÃO FUNDAMENTAL #2**
    // Passamos os dados do autor se ele existir.
    // Se não existir, ou se não tiver avatar, o valor será `null`.
    return {
      ...post,
      authorName: authorData?.name || 'Usuário OLLO',
      // Passa a avatarUrl real (que pode ser null) ou explicitamente null.
      authorAvatar: authorData?.avatarUrl || null,
    };
  });

  return enrichedPosts;
};

// As funções abaixo já parecem corretas, mas revise os nomes dos campos como `authorid` para `authorId`.
// Por consistência, vou corrigi-los aqui também.

export const getPostsByUserId = async (userId) => {
  const postsRef = collection(db, 'posts');
  // Correção: authorid -> authorId
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

export const addCommentToPost = (postId, commentData) => {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  return addDoc(commentsCollectionRef, { ...commentData, createdAt: serverTimestamp() });
};

// Se você usa enrichPostData em algum lugar, ela também precisa ser corrigida:
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