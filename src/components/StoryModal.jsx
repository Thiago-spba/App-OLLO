import React, { useEffect, useState, useRef } from 'react';
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import PropTypes from 'prop-types';

// Duração padrão para stories de imagem/texto (em ms)
const STORY_DURATION = 5000;

const StoryModal = ({
  story,
  onClose,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}) => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0); // 0 a 100
  const [paused, setPaused] = useState(false);

  const progressRef = useRef();
  const timeoutRef = useRef();
  const modalRef = useRef(null);
  const videoRef = useRef(null);

  // Reseta ao abrir novo story
  useEffect(() => {
    setShowModal(true);
    setMediaLoaded(story.mediaType === 'text'); // texto não precisa "carregar"
    setProgress(0);
    setPaused(false);
    if (videoRef.current) videoRef.current.currentTime = 0;
    return () => setShowModal(false);
    // eslint-disable-next-line
  }, [story]);

  // Fecha com ESC
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [onClose]);

  // Navegação por setas do teclado
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'ArrowLeft' && !disablePrev) onPrev();
      if (e.key === 'ArrowRight' && !disableNext) onNext();
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [onPrev, onNext, disablePrev, disableNext]);

  // Foco automático no botão fechar ao trocar story
  useEffect(() => {
    if (modalRef.current) {
      const closeButton = modalRef.current.querySelector(
        '[aria-label="Fechar"]'
      );
      if (closeButton) closeButton.focus();
    }
  }, [story]);

  // Clique fora do modal fecha
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Controle da barra de progresso
  useEffect(() => {
    // Não inicia barra se mídia não carregou, ou se está pausado
    if (!mediaLoaded || paused) return;

    // Tempo de duração do story
    let duration = STORY_DURATION;
    if (story.mediaType === 'video' && videoRef.current) {
      duration = (videoRef.current.duration || STORY_DURATION) * 1000;
    }

    let start = performance.now();
    let lastProgress = progress;

    function step(now) {
      if (!mediaLoaded || paused) return;
      const elapsed = now - start;
      const nextProgress = Math.min(
        100,
        lastProgress + (elapsed / duration) * (100 - lastProgress)
      );
      setProgress(nextProgress);

      if (nextProgress < 100) {
        progressRef.current = requestAnimationFrame(step);
      } else {
        // Avança para o próximo story quando barra completa
        onNext && onNext();
      }
    }
    progressRef.current = requestAnimationFrame(step);

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
    // eslint-disable-next-line
  }, [mediaLoaded, paused, story]);

  // Pausa/resume barra ao pausar/continuar vídeo
  const handleVideoPlay = () => setPaused(false);
  const handleVideoPause = () => setPaused(true);

  // Pausa barra ao manter mouse pressionado (press and hold)
  const handlePointerDown = () => setPaused(true);
  const handlePointerUp = () => setPaused(false);

  // Renderização conforme tipo de mídia
  let mediaElement = null;
  if (story.mediaType === 'image') {
    mediaElement = (
      <img
        src={story.mediaUrl}
        alt={`Story de ${story.userDisplayName}`}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={false}
        onLoad={() => setMediaLoaded(true)}
        onError={() => setMediaLoaded(false)}
        style={{
          borderRadius: 'inherit',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    );
  } else if (story.mediaType === 'video') {
    mediaElement = (
      <video
        ref={videoRef}
        src={story.mediaUrl}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        loop
        muted
        controls
        onLoadedData={() => setMediaLoaded(true)}
        onError={() => setMediaLoaded(false)}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        style={{
          borderRadius: 'inherit',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          background: '#151D1B',
        }}
      />
    );
  } else if (story.mediaType === 'text') {
    mediaElement = (
      <div
        className={`absolute inset-0 flex items-center justify-center p-6 z-0 transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'linear-gradient(120deg, #1d312c 75%, #2a6047 100%)',
          borderRadius: 'inherit',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <span className="text-white text-2xl font-semibold text-center w-full break-words drop-shadow-lg">
          {story.textContent}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`}
      aria-modal="true"
      role="dialog"
    >
      {/* Borda verde animada com efeito metálico */}
      <div
        ref={modalRef}
        className={`relative w-[80vw] max-w-[340px] h-[440px] mx-4 rounded-xl overflow-hidden shadow-2xl bg-gray-900 transition-all duration-300 ${showModal ? 'scale-100' : 'scale-95'} border-4`}
        style={{
          borderImage:
            'linear-gradient(120deg, #69ffb3 10%, #20e36a 45%, #3ef6cb 80%, #2af598 100%) 1',
          boxShadow:
            '0 0 32px 4px rgba(69, 242, 154, 0.20), 0 0 0 4px #69ffb355',
          background: 'linear-gradient(120deg, #151D1B 75%, #1f3d30 100%)',
          borderRadius: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Barra de progresso */}
        <div
          className="absolute top-0 left-0 w-full h-1.5 z-30 rounded-t-xl overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #73ffa1 10%, #1cb04c 100%)',
            opacity: 0.2,
          }}
        >
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${progress}%`,
              background:
                'linear-gradient(90deg, #69ffb3 0%, #20e36a 60%, #38ef7d 100%)',
              boxShadow: '0 0 8px #69ffb3, 0 0 24px #20e36a55',
            }}
          />
        </div>

        {/* Loading */}
        {!mediaLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#151D1B] via-[#0b2010] to-[#182b24] flex items-center justify-center z-20">
            <div className="animate-pulse text-green-400">Carregando...</div>
          </div>
        )}

        {/* Mídia (imagem, vídeo ou texto) */}
        {mediaElement}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

        {/* Cabeçalho */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold bg-white/90 text-green-700 shadow-md border-2 border-green-400/70">
              {story.userDisplayName ? story.userDisplayName[0] : '?'}
            </div>
            <span className="text-white font-medium drop-shadow-md">
              {story.userDisplayName}
            </span>
          </div>
          <button
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors focus:ring-2 focus:ring-green-400 focus:outline-none"
            onClick={onClose}
            aria-label="Fechar"
            tabIndex={0}
            type="button"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Navegação */}
        <div className="absolute inset-0 z-20 flex items-center justify-between px-2 pointer-events-none">
          <button
            className={`p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors pointer-events-auto focus:ring-2 focus:ring-green-400 focus:outline-none ${disablePrev ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={onPrev}
            disabled={disablePrev}
            aria-label="Story anterior"
            tabIndex={0}
            type="button"
          >
            <CaretLeft size={28} weight="bold" className="text-green-300" />
          </button>
          <button
            className={`p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors pointer-events-auto focus:ring-2 focus:ring-green-400 focus:outline-none ${disableNext ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={onNext}
            disabled={disableNext}
            aria-label="Próximo story"
            tabIndex={0}
            type="button"
          >
            <CaretRight size={28} weight="bold" className="text-green-300" />
          </button>
        </div>

        {/* Área interativa para navegação rápida */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={!disablePrev ? onPrev : undefined}
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={!disableNext ? onNext : undefined}
          />
        </div>
      </div>
    </div>
  );
};

StoryModal.propTypes = {
  story: PropTypes.shape({
    mediaType: PropTypes.string.isRequired,
    mediaUrl: PropTypes.string,
    textContent: PropTypes.string,
    userDisplayName: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  disablePrev: PropTypes.bool,
  disableNext: PropTypes.bool,
};

export default StoryModal;
