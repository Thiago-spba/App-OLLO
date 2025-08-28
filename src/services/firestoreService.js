// src/services/firestoreService.js (VERSÃO FINALÍSSIMA, COM LÓGICA DE FEED PROFISSIONAL)

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
  limit, // Importamos para paginação futura
} from 'firebase/firestore';

// ========================================================================
// FUNÇÕES DE USUÁRIO (Já estão corretas e otimizadas)
// ========================================================================

export const createUserProfile = async (uid, profileData) => {
  try {
    console.log("[OLLO] Criando perfil para usuário:", uid, profileData);
    
    const privateProfileRef = doc(db, 'users', uid);
    const publicProfileRef = doc(db, 'users_public', uid);
    const batch = writeBatch(db);

    // Se o username não foi fornecido, cria um usando o prefixo "user_" e os primeiros 5 caracteres do UID
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
      avatarUrl: '/images/default-avatar.png',
      bio: '',
    };
    
    batch.set(privateProfileRef, privateData);
    batch.set(publicProfileRef, publicData);
    await batch.commit();
    
    console.log("[OLLO] Perfil criado com sucesso:", username);
    
    return { ...privateData, ...publicData, username };
  } catch (error) {
    console.error("[OLLO] Erro ao criar perfil de usuário:", error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const privateDocRef = doc(db, 'users', uid);
  const publicDocRef = doc(db, 'users_public', uid);
  const [privateDocSnap, publicDocSnap] = await Promise.all([
    getDoc(privateDocRef),
    getDoc(publicDocRef),
  ]);
  if (!publicDocSnap.exists()) return null;
  return { id: uid, ...privateDocSnap.data(), ...publicDocSnap.data() };
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
 * NOVA FUNÇÃO MESTRA: Busca posts do feed e os enriquece de forma eficiente.
 * Esta função substitui o loop de `enrichPostData` e resolve o problema de performance e permissões.
 */
export const getFeedPosts = async () => {
  // 1. Busca os posts mais recentes. Limitamos a 25 para começar.
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(25));
  const postsSnapshot = await getDocs(postsQuery);
  const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (posts.length === 0) {
    return []; // Retorna um array vazio se não houver posts.
  }

  // 2. Coleta todos os UIDs únicos dos autores para evitar buscas repetidas.
  const authorIds = [...new Set(posts.map(post => post.authorid).filter(Boolean))];
  
  // Se não houver autores, não precisamos buscar perfis.
  if (authorIds.length === 0) {
    return posts.map(post => ({ ...post, userName: 'Anônimo', userAvatar: '/images/default-avatar.png' }));
  }

  // 3. Busca todos os perfis públicos necessários de UMA SÓ VEZ.
  const authorsQuery = query(collection(db, 'users_public'), where('__name__', 'in', authorIds));
  const authorsSnapshot = await getDocs(authorsQuery);
  
  // 4. Mapeia os dados dos autores para fácil acesso (ex: { uid: { name, avatarUrl } })
  const authorsMap = {};
  authorsSnapshot.forEach(doc => {
    authorsMap[doc.id] = doc.data();
  });

  // 5. "Enriquece" os posts em memória, o que é instantâneo.
  const enrichedPosts = posts.map(post => {
    const authorData = authorsMap[post.authorid] || { name: 'Usuário Desconhecido', avatarUrl: '/images/default-avatar.png' };
    return {
      ...post,
      userName: authorData.name,
      userAvatar: authorData.avatarUrl,
    };
  });

  return enrichedPosts;
};

/*
  A função `enrichPostData` é mantida aqui caso seja usada para buscar um
  ÚNICO post em outra página, mas ela NÃO DEVE ser usada em loops.
*/
export const enrichPostData = async (post) => {
  if (!post.authorid) {
    console.warn(`Post ${post.id} sem authorid.`);
    return { ...post, userName: 'Anônimo', userAvatar: '/images/default-avatar.png', comments: [] };
  }
  const userDoc = await getDoc(doc(db, 'users_public', post.authorid));
  const userData = userDoc.exists() ? userDoc.data() : { name: 'Usuário Deletado' };
  
  // A lógica de enriquecer comentários pode ser movida para cá também se necessário
  return { ...post, userName: userData.name, userAvatar: userData.avatarUrl };
};

// As outras funções auxiliares permanecem as mesmas.
export const getPostsByUserId = async (userId) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where("authorid", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const togglePostLike = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) throw new Error('Post não encontrado!');
  const postData = postDoc.data();
  const updateAction = postData.likes?.includes(userId) ? arrayRemove : arrayUnion;
  return updateDoc(postRef, { likes: updateAction(userId) });
};

export const deletePostById = (postId) => {
  const postRef = doc(db, 'posts', postId);
  return deleteDoc(postRef);
};

export const addCommentToPost = (postId, commentData) => {
  const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
  return addDoc(commentsCollectionRef, { ...commentData, createdAt: serverTimestamp() });
};