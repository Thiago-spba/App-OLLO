// src/components/SidebarNav.jsx
import { NavLink } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

function SidebarNav({ openCreatePostModal }) {

  // Função para classes dos links de navegação da Sidebar
  const getSidebarNavLinkClass = ({ isActive }) => {
    // Ajustado padding e justificação para responsividade
    const baseClasses = "flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start";
    if (isActive) {
      return `${baseClasses} bg-ollo-accent-light text-ollo-deep shadow-sm`;
    }
    return `${baseClasses} text-ollo-deep hover:bg-gray-200/70 hover:text-ollo-deep`;
  };

  // O botão "Ollo co que fas!" na sidebar
  const createPostButtonClass = "w-full flex items-center justify-center mt-4 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-ollo-accent-light text-ollo-accent-light hover:bg-ollo-accent-light hover:text-ollo-deep active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-bg-light";

  return (
    // --- MODIFICADO: Largura e padding responsivos para a sidebar ---
    // Adicionado transition-all e duration para suavizar a mudança de largura
    <div className="h-screen bg-ollo-bg-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-300/70 shadow-sm transition-all duration-300 ease-in-out">
      {/* Logo */}
      {/* --- MODIFICADO: Logo responsivo --- */}
      <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex items-center justify-center lg:justify-start lg:px-2">
        <NavLink 
          to="/" 
          className="text-ollo-deep focus:outline-none focus:ring-2 focus:ring-ollo-deep focus:ring-offset-2 focus:ring-offset-ollo-bg-light rounded-sm flex items-center"
          title="Página Inicial OLLO"
        >
          {/* Ícone do logo sempre visível, texto aparece em telas lg */}
          <svg className="h-8 w-auto text-ollo-deep lg:hidden" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 38C29.4934 38 38 29.4934 38 19C38 8.50659 29.4934 0 19 0C8.50659 0 0 8.50659 0 19C0 29.4934 8.50659 38 19 38Z" fill="#005A4B"/>
            <path d="M12.0946 24.6719V19.4793C12.0946 16.81 13.3501 15.4753 15.8611 15.4753H16.5516C18.0603 15.4753 19.1985 14.7026 19.1985 13.4955C19.1985 12.2884 18.0603 11.5158 16.5516 11.5158H15.1706V8H17.023C20.0483 8 22.7178 9.69909 22.7178 13.1249C22.7178 15.7944 21.1316 17.647 19.1985 18.3375V18.4328C21.4621 18.9519 23.3147 20.8046 23.3147 23.6686V24.6719H19.7448V23.3818C19.7448 21.729 18.3888 20.6352 16.5516 20.6352H15.8611C13.8215 20.6352 12.0946 22.2417 12.0946 24.6719Z" fill="#A0D2DB"/>
          </svg>
          <span className="text-3xl font-bold hidden lg:inline">OLLO</span>
        </NavLink>
      </div>

      {/* Links de Navegação da Sidebar */}
      <nav className="flex-grow space-y-2">
        <NavLink to="/" title="Página Inicial" className={getSidebarNavLinkClass} end> 
          <HomeIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" /> {/* Ícone maior, margem responsiva */}
          {/* --- MODIFICADO: Texto do link responsivo --- */}
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
          <PencilSquareIcon className="h-5 w-5 lg:mr-2" /> {/* Margem responsiva */}
          {/* --- MODIFICADO: Texto do botão responsivo --- */}
          <span className="hidden lg:inline">Ollo co que fas!</span>
        </button>
      </div>
    </div>
  );
}

export default SidebarNav;