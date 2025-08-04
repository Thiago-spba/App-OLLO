import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X, SpinnerGap } from '@phosphor-icons/react';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const MEDIA_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/ogg',
];

function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  useEffect(() => {
    const handler = () => {
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      );
    };
    const events = ['click', 'keydown'];
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, []);
  return theme;
}

function CreateStoryModal({ onClose, onStoryCreated }) {
  const { currentUser } = useAuth();
  const theme = useTheme();

  const [state, setState] = useState({
    media: null,
    mediaPreview: null,
    mediaType: null,
    text: '',
    uploading: false,
    progress: 0,
    error: '',
  });

  const { media, mediaPreview, mediaType, text, uploading, progress, error } =
    state;

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  useEffect(() => {
    if (uploading) return;
    const escHandler = (e) => e.key === 'Escape' && safeClose();
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [uploading]);

  const safeClose = useCallback(() => {
    if (!uploading && typeof onClose === 'function') onClose();
  }, [onClose, uploading]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) safeClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!MEDIA_TYPES.includes(file.type)) {
      updateState({ error: 'Formato não suportado. Só imagem ou vídeo.' });
      return;
    }
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);

    updateState({
      media: file,
      mediaType: file.type.startsWith('image') ? 'image' : 'video',
      mediaPreview: URL.createObjectURL(file),
      error: '',
    });
  };

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop();
    const storageRef = ref(
      getStorage(),
      `stories/${currentUser.uid}/${Date.now()}.${ext}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          updateState({
            progress: Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            ),
          });
        },
        (error) => reject(error),
        () =>
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject)
      );
    });
  };

  const validateInputs = () => {
    if (!media && !text.trim()) return 'Escolha uma mídia ou escreva um texto.';
    if (text.length > 120)
      return 'O texto não pode ter mais de 120 caracteres.';
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      updateState({ error: validationError });
      return;
    }
    updateState({ uploading: true, error: '', progress: 0 });
    try {
      const mediaUrl = media ? await uploadFile(media) : null;
      await addDoc(collection(getFirestore(), 'stories'), {
        userId: currentUser.uid,
        userName: currentUser.name || 'Usuário OLLO',
        userAvatar: currentUser.avatarUrl || '/images/default-avatar.png',
        mediaUrl,
        mediaType,
        text: text.trim(),
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        visible: true,
      });

      updateState({ uploading: false });
      onStoryCreated?.();
      safeClose();
    } catch (err) {
      console.error('Erro no upload:', err);
      updateState({
        uploading: false,
        error:
          err.code === 'storage/unauthorized'
            ? 'Você não tem permissão para fazer upload.'
            : 'Falha ao salvar o story. Tente novamente.',
      });
    }
  };

  // --- Estilos igual ao print, 100% responsivo ao tema!
  const modalBg = theme === 'dark' ? '#181d22' : '#f5f8fa';

  const borderCol = '#17ed96';
  const boxShadow =
    theme === 'dark' ? '0 8px 40px 0 #121e232c' : '0 6px 32px 0 #17ed9622';

  const cardBg = theme === 'dark' ? '#1e232a' : '#fff';

  const inputBg = theme === 'dark' ? '#232a32' : '#f7fafc';

  const inputColor = theme === 'dark' ? '#f2f5f7' : '#232a32';
  const labelColor = '#14e3a1';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99,
        background:
          theme === 'dark' ? 'rgba(16,20,28,0.82)' : 'rgba(32,38,41,0.09)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <form
        style={{
          minWidth: 370,
          width: '100%',
          maxWidth: 490,
          borderRadius: 15,
          padding: '26px 0 0 0',
          border: 'none',
          background: modalBg,
          color: theme === 'dark' ? '#eafcf1' : '#1a2b22',
          fontFamily: "'Inter', 'Montserrat', Arial, sans-serif",
          position: 'relative',
          margin: '0 12px',
          boxShadow,
        }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleUpload}
      >
        {/* Header com título */}
        <div
          style={{
            padding: '0 34px 20px 34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 25,
              color: '#17ed96',
              letterSpacing: 0.03,
            }}
          >
            Criar Story
          </span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 24,
              cursor: 'pointer',
              padding: 2,
              marginRight: -6,
              marginTop: 1,
            }}
            onClick={safeClose}
            disabled={uploading}
            aria-label="Fechar"
          >
            <X size={25} weight="bold" />
          </button>
        </div>

        {/* Card interno */}
        <div
          style={{
            background: cardBg,
            border: `2px solid ${borderCol}`,
            borderRadius: 18,
            boxShadow:
              theme === 'dark'
                ? '0 1.5px 18px #17ed9630'
                : '0 2px 13px #14e3a112',
            margin: '0 25px 28px 25px',
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
          }}
        >
          {/* LOGO + "Criar publicação" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <img
              src="/images/logo_ollo.jpeg"
              alt="Logo OLLO"
              style={{
                width: 45,
                height: 45,
                borderRadius: 50,
                background: '#101a15',
                border: '2.2px solid #17ed96',
                objectFit: 'cover',
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                  letterSpacing: 0.01,
                  color: theme === 'dark' ? '#f2f8f3' : '#191b19',
                  lineHeight: 1.16,
                }}
              >
                Criar publicação
              </div>
              <div
                style={{
                  fontWeight: 400,
                  fontSize: 14.3,
                  marginTop: 1,
                  color: theme === 'dark' ? '#d7f9ec' : '#222',
                  opacity: 0.88,
                  lineHeight: 1.12,
                }}
              >
                Compartilhe algo incrível com a comunidade
              </div>
            </div>
          </div>

          {/* Campo de texto */}
          <div>
            <textarea
              value={text}
              onChange={(e) => updateState({ text: e.target.value })}
              rows={3}
              maxLength={120}
              placeholder="No que você está pensando?"
              disabled={uploading}
              style={{
                width: '100%',
                borderRadius: 12,
                border: `1.5px solid ${theme === 'dark' ? '#2be8ae44' : '#e7faf2'}`,
                background: inputBg,
                color: inputColor,
                padding: '16px 16px',
                fontSize: 16.6,
                fontWeight: 500,
                outline: 'none',
                marginBottom: 3,
                boxShadow:
                  theme === 'dark'
                    ? '0 1.5px 7px #17ed9620'
                    : '0 2px 5px #15ea9e09',
                resize: 'none',
              }}
            />
            <div
              style={{
                textAlign: 'right',
                fontSize: 13,
                color: labelColor,
                marginTop: 2,
                opacity: 0.93,
              }}
            >
              {text.length}/120 caracteres
            </div>
          </div>

          {/* Campo de upload */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15.4,
                color: labelColor,
                marginBottom: 9,
                letterSpacing: 0.01,
              }}
            >
              Adicionar à publicação
            </div>
            <div
              style={{
                background: theme === 'dark' ? '#181d24' : '#f7fafc',
                border: `1.2px solid ${theme === 'dark' ? '#19f4a054' : '#e7faf2'}`,
                borderRadius: 11,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <input
                type="file"
                accept="image/*,video/*"
                id="ollo-file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  width: 35,
                  height: 35,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              />
              <label
                htmlFor="ollo-file"
                style={{
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontWeight: 500,
                  fontSize: 15.5,
                  color: '#17ed96',
                }}
              >
                <span
                  style={{
                    background: '#17ed96',
                    borderRadius: 5,
                    padding: '4px 7px',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    marginRight: 2,
                    boxShadow:
                      theme === 'dark'
                        ? '0 1.5px 7px #13e38f10'
                        : '0 1.5px 7px #13e38f10',
                  }}
                >
                  <svg width="19" height="17" viewBox="0 0 20 17" fill="none">
                    <path
                      d="M5.625 9.417l2.792 2.916a1.25 1.25 0 001.791 0l3.209-3.333"
                      stroke="#fff"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="1.5"
                      y="2.5"
                      width="17"
                      height="12"
                      rx="2.5"
                      stroke="#fff"
                      strokeWidth="1.7"
                    />
                  </svg>
                </span>
                {media ? media.name : 'Imagem/Vídeo'}
              </label>
              {mediaPreview && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 14,
                    color: '#17ed96',
                    fontWeight: 600,
                    opacity: 0.93,
                  }}
                >
                  Arquivo selecionado
                </span>
              )}
            </div>
            {/* Preview */}
            {mediaPreview && (
              <div
                style={{
                  marginTop: 13,
                  borderRadius: 11,
                  overflow: 'hidden',
                  width: 110,
                  height: 65,
                  border: `1.2px solid #17ed96`,
                  background: '#0f1717',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow:
                    theme === 'dark'
                      ? '0 1.5px 7px #17ed9620'
                      : '0 2px 6px #15ea9e10',
                }}
              >
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Erro */}
          {error && (
            <div
              style={{
                color: '#ff7373',
                marginBottom: 7,
                fontWeight: 600,
                fontSize: 14,
                marginTop: -8,
              }}
            >
              {error}
            </div>
          )}

          {/* Progresso */}
          {uploading && (
            <div
              style={{
                marginBottom: 11,
                width: '100%',
                background: '#e3fff3',
                borderRadius: 6,
                height: 6,
                marginTop: -5,
              }}
            >
              <div
                style={{
                  background: '#17ed96',
                  height: 6,
                  borderRadius: 6,
                  width: `${progress}%`,
                  transition: 'width .2s',
                }}
              ></div>
            </div>
          )}

          {/* Botão publicar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 6,
            }}
          >
            <button
              type="submit"
              disabled={uploading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: '#17ed96',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 17,
                padding: '11px 23px',
                borderRadius: 10,
                cursor: uploading ? 'not-allowed' : 'pointer',
                boxShadow:
                  theme === 'dark'
                    ? '0 2px 9px #15e29735'
                    : '0 2px 8px #15e29722',
                letterSpacing: 0.01,
                transition: 'background .15s',
              }}
            >
              {uploading ? (
                <>
                  <SpinnerGap
                    size={20}
                    weight="bold"
                    className="animate-spin"
                  />
                  Enviando...
                </>
              ) : (
                <>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <path d="M3 20l18-8-18-8v6l12 2-12 2v6z" fill="#fff" />
                  </svg>
                  Publicar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

CreateStoryModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onStoryCreated: PropTypes.func,
};

export default CreateStoryModal;
