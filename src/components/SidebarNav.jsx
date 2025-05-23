// src/components/SidebarNav.jsx
import { NavLink } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

function SidebarNav({ openCreatePostModal }) {

  // Função para classes dos links de navegação da Sidebar
  const getSidebarNavLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start";
    if (isActive) {
      return `${baseClasses} bg-ollo-accent-light text-ollo-deep shadow-sm`;
    }
    return `${baseClasses} text-ollo-deep hover:bg-gray-200/70 hover:text-ollo-deep`;
  };

  // O botão "Ollo co que fas!" na sidebar
  const createPostButtonClass = "w-full flex items-center justify-center mt-4 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-ollo-accent-light text-ollo-accent-light hover:bg-ollo-accent-light hover:text-ollo-deep active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-bg-light";

  return (
    <div className="h-screen bg-ollo-bg-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-300/70 shadow-sm transition-all duration-300 ease-in-out">
      
      {/* ========== LOGO ATUALIZADO: MAIOR E SEMPRE CENTRALIZADO ========== */}
      {/* MUDANÇA: 'justify-center' agora se aplica a todos os tamanhos. 'lg:justify-start' foi removido. */}
      <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex items-center justify-center">
        <NavLink 
          to="/" 
          className="focus:outline-none focus:ring-2 focus:ring-ollo-deep focus:ring-offset-2 focus:ring-offset-ollo-bg-light rounded-md"
          title="Página Inicial OLLO"
        >
          <img
            src="/images/logo_ollo.jpeg"
            alt="Logo OLLO"
            // MUDANÇA: Altura aumentada de h-12 para h-16 (64px).
            className="h-16 w-auto"
          />
        </NavLink>
      </div>

      {/* Links de Navegação da Sidebar */}
      <nav className="flex-grow space-y-2">
        <NavLink to="/" title="Página Inicial" className={getSidebarNavLinkClass} end> 
          <HomeIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Página Inicial</span>
        </NavLink>
        <NavLink to="/explore" title="Explorar" className={getSidebarNavLinkClass}>
          <MagnifyingGlassIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Dar un ollo</span>
        </NavLink>
        <NavLink to="/notifications" title="Atividade" className={getSidebarNavLinkClass}>
          <BellIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Ollo á xente</span>
        </NavLink>
        <NavLink to="/profile" title="Perfil" className={getSidebarNavLinkClass}>
          <UserCircleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
          <span className="hidden lg:inline">Meu Perfil</span>
        </NavLink>
      </nav>

      {/* Botão "Ollo co que fas!" na parte inferior da Sidebar */}
      <div className="mt-auto flex-shrink-0 pb-2">
        <button
          title="Criar nova postagem" 
          onClick={openCreatePostModal}
          className={createPostButtonClass}
        >
          <PencilSquareIcon className="h-5 w-5 lg:mr-2" />
          <span className="hidden lg:inline">Ollo co que fas!</span>
        </button>
      </div>
    </div>
  );
}

export default SidebarNav;