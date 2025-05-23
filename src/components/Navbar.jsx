// src/components/Navbar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function Navbar({ openCreatePostModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Função para classes dos links de navegação (DESKTOP)
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses = "px-3 py-2 text-sm font-medium block relative transition-colors duration-200 ease-in-out";
    // Estilo do sublinhado para o link ativo
    const activeClasses = "text-ollo-deep font-semibold after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-[2px] after:bg-ollo-accent-light after:rounded-full";
    const inactiveClasses = "text-gray-500 hover:text-ollo-deep";
    
    return isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };
  
  // --- NOVO: Função de classe específica para links no MENU MOBILE ---
  const getMobileNavLinkClass = ({ isActive }) => {
    const baseClasses = "block px-3 py-3 rounded-md text-base font-medium transition-colors duration-150 ease-in-out"; // Fonte maior (text-base) e mais padding vertical (py-3)
    if (isActive) {
      // Estilo ATIVO para mobile: fundo ollo-accent-light com texto ollo-deep
      return `${baseClasses} bg-ollo-accent-light text-ollo-deep shadow-sm`;
    }
    // Estilo INATIVO para mobile: texto mais escuro, hover sutil
    return `${baseClasses} text-gray-700 hover:text-ollo-deep hover:bg-gray-200/70`;
  };

  // Botão "Ollo co que fas!" dentro do menu mobile (mantido como você definiu)
  const getMobileButtonClass = () => {
    return "w-full text-center mt-2 px-4 py-2.5 rounded-lg text-base font-semibold border-2 border-ollo-accent-light text-ollo-accent-light hover:bg-ollo-accent-light hover:text-ollo-deep active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-bg-light block";
    // Adicionado text-base para consistência e block para garantir que o w-full funcione bem
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleOlloButtonClick = () => {
    openCreatePostModal();
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  return (
    <nav className="bg-ollo-bg-light border-b border-gray-300/70 shadow-sm w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink 
              to="/" 
              // --- MODIFICADO: Tamanho da fonte do logo responsivo ---
              className="text-2xl md:text-3xl font-bold text-ollo-deep focus:outline-none focus:ring-2 focus:ring-ollo-deep focus:ring-offset-2 focus:ring-offset-ollo-bg-light rounded-sm"
              title="Página Inicial OLLO"
            >
              OLLO
            </NavLink>
          </div>

          {/* Links do Desktop (inalterado, já usa md:block) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2 lg:space-x-4">
              <NavLink to="/explore" title="Explorar" className={getNavLinkClass}>Dar un ollo</NavLink>
              <NavLink to="/notifications" title="Atividade" className={getNavLinkClass}>Ollo á xente</NavLink>
              <NavLink to="/profile" title="Perfil" className={getNavLinkClass}>Meu Perfil</NavLink>
              <button
                title="Criar nova postagem" 
                onClick={handleOlloButtonClick}
                className="ml-4 px-4 py-1.5 rounded-lg text-sm font-semibold border-2 border-ollo-accent-light text-ollo-accent-light hover:bg-ollo-accent-light hover:text-ollo-deep active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-bg-light"
              >
                Ollo co que fas!
              </button>
            </div>
          </div>

          {/* Botão do Menu Mobile (Hamburger) (inalterado) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-transparent inline-flex items-center justify-center p-2 rounded-md text-ollo-deep hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ollo-deep"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-7 w-7" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-7 w-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-ollo-bg-light/95 backdrop-blur-md shadow-xl border-t border-gray-300/70" id="mobile-menu">
          {/* --- MODIFICADO: Ajustes no padding e espaçamento, e uso de getMobileNavLinkClass --- */}
          <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4"> {/* Aumentado pt, pb e space-y */}
            <NavLink to="/explore" title="Explorar" className={getMobileNavLinkClass} onClick={toggleMobileMenu}>Dar un ollo</NavLink>
            <NavLink to="/notifications" title="Atividade" className={getMobileNavLinkClass} onClick={toggleMobileMenu}>Ollo á xente</NavLink>
            <NavLink to="/profile" title="Perfil" className={getMobileNavLinkClass} onClick={toggleMobileMenu}>Meu Perfil</NavLink>
            <button
              title="Criar nova postagem"
              onClick={handleOlloButtonClick}
              className={getMobileButtonClass()} 
            >
              Ollo co que fas!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;