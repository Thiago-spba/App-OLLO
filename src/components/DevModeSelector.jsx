import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Componente para gerenciar configurações de desenvolvimento do Firebase
 * Exibe apenas em ambiente de desenvolvimento
 */
const DevModeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [useEmulators, setUseEmulators] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Carrega configurações atuais
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    try {
      // Verifica configurações no localStorage
      const emulatorConfig = localStorage.getItem('OLLO_EMULATOR_CONFIG');
      if (emulatorConfig) {
        const config = JSON.parse(emulatorConfig);
        setUseEmulators(config.enabled === true);
      } else {
        // Verifica variável de ambiente
        setUseEmulators(import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true');
      }

      // Verifica se devtools já foram abertas antes
      const devToolsShown = localStorage.getItem('OLLO_DEVTOOLS_SHOWN');
      if (!devToolsShown) {
        // Mostrar automaticamente na primeira execução
        setShowDevTools(true);
        localStorage.setItem('OLLO_DEVTOOLS_SHOWN', 'true');
      }
    } catch (err) {
      console.error('[OLLO] Erro ao carregar configurações de desenvolvimento:', err);
    }
  }, []);

  // Não renderiza nada em produção
  if (!import.meta.env.DEV) return null;

  const toggleEmulators = () => {
    try {
      const newState = !useEmulators;
      setUseEmulators(newState);
      
      // Salva a configuração
      localStorage.setItem('OLLO_EMULATOR_CONFIG', JSON.stringify({ enabled: newState }));
      
      toast.success(
        newState 
          ? 'Emuladores Firebase ativados. Recarregando...' 
          : 'Usando Firebase de produção. Recarregando...'
      );
      
      // Recarrega para aplicar as mudanças
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('[OLLO] Erro ao alternar modo de emulador:', err);
      toast.error('Erro ao alterar configurações');
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão flutuante de dev tools */}
      <button
        onClick={togglePanel}
        className="fixed bottom-4 right-4 bg-gray-900 text-white p-2 rounded-full shadow-lg z-50 flex items-center justify-center h-10 w-10 hover:bg-gray-800"
        title="Ferramentas de desenvolvimento"
      >
        <DevToolsIcon />
      </button>

      {/* Painel de configuração */}
      {(isOpen || showDevTools) && (
        <div className="fixed bottom-16 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-4 z-50 w-72 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Modo Desenvolvimento</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowDevTools(false);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Fechar"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Emuladores Firebase Local
              </label>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  name="useEmulators"
                  id="useEmulators"
                  checked={useEmulators}
                  onChange={toggleEmulators}
                  className="sr-only"
                />
                <div className={`
                  block w-12 h-6 rounded-full 
                  ${useEmulators ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                  cursor-pointer
                `} />
                <div className={`
                  absolute left-1 top-1 w-4 h-4 rounded-full bg-white
                  transform transition-transform
                  ${useEmulators ? 'translate-x-6' : ''}
                `} />
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {useEmulators ? (
                  <>
                    <span className="block mb-1 font-medium text-blue-500">Usando emuladores locais</span>
                    <p>Os dados não serão persistidos em produção.</p>
                    <p className="mt-1">Certifique-se de iniciar os emuladores: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">firebase emulators:start</code></p>
                  </>
                ) : (
                  <>
                    <span className="block mb-1 font-medium text-yellow-500">Usando Firebase de produção</span>
                    <p>O domínio <strong>{window.location.origin}</strong> precisa estar autorizado no Firebase Console.</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              OLLO App - Versão de Desenvolvimento
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// Ícone para o botão de ferramentas de desenvolvimento
const DevToolsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

export default DevModeSelector;
