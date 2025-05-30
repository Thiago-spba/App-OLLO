// src/components/SidebarNav.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    HomeIcon, 
    MagnifyingGlassIcon, 
    BellIcon, 
    UserCircleIcon, 
    PencilSquareIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';

function SidebarNav({ openCreatePostModal }) {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); 
            navigate('/login'); 
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const getSidebarNavLinkClass = ({ isActive }) => {
        const baseClasses = "flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start";
        if (isActive) {
            return `${baseClasses} bg-ollo-accent-light text-ollo-deep shadow-sm`;
        }
        return `${baseClasses} text-ollo-deep hover:bg-gray-200/70 hover:text-ollo-deep`;
    };
    
    const logoutButtonClass = "w-full flex items-center px-3 lg:px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out group justify-center lg:justify-start text-ollo-deep hover:bg-red-100 hover:text-red-700";

    // MUDANÇA AQUI: classes de borda removidas de createPostButtonClass
    const createPostButtonClass = "w-full flex items-center justify-center mt-4 px-3 lg:px-4 py-2.5 rounded-lg text-sm font-semibold text-ollo-accent-light hover:bg-ollo-accent-light hover:text-ollo-deep active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ollo-accent-light focus:ring-offset-2 focus:ring-offset-ollo-bg-light";

    return (
        <div className="h-screen bg-ollo-bg-light w-20 lg:w-64 flex flex-col p-3 lg:p-4 border-r border-gray-300/70 shadow-sm transition-all duration-300 ease-in-out">
            
            <div className="mb-8 lg:mb-10 flex-shrink-0 pt-2 flex items-center justify-center">
                <NavLink 
                    to="/" 
                    className="focus:outline-none focus:ring-2 focus:ring-ollo-deep focus:ring-offset-2 focus:ring-offset-ollo-bg-light rounded-md"
                    title="Página Inicial OLLO"
                >
                    <img
                        src="/images/logo_ollo.jpeg"
                        alt="Logo OLLO"
                        className="h-16 w-auto"
                    />
                </NavLink>
            </div>

            <nav className="flex-grow space-y-2">
                <NavLink to="/" title="Página Inicial" className={getSidebarNavLinkClass} end> 
                    <HomeIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                    <span className="hidden lg:inline">Página Inicial</span>
                </NavLink>
                <NavLink to="/explore" title="Explorar" className={getSidebarNavLinkClass}>
                    <MagnifyingGlassIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                    <span className="hidden lg:inline">Dar un ollo</span>
                </NavLink>

                {isAuthenticated ? (
                    <>
                        <NavLink to="/notifications" title="Atividade" className={getSidebarNavLinkClass}>
                            <BellIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                            <span className="hidden lg:inline">Ollo á xente</span>
                        </NavLink>
                        <NavLink to="/profile" title="Perfil" className={getSidebarNavLinkClass}>
                            <UserCircleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                            <span className="hidden lg:inline">Meu Perfil</span>
                        </NavLink>
                    </>
                ) : null}
            </nav>

            <div className="mt-auto flex-shrink-0 pb-2 space-y-2">
                {isAuthenticated ? (
                    <>
                        <button
                            title="Criar nova postagem" 
                            onClick={openCreatePostModal}
                            className={createPostButtonClass}
                        >
                            <PencilSquareIcon className="h-5 w-5 lg:mr-2" />
                            <span className="hidden lg:inline">Ollo co que fas!</span>
                        </button>
                        <button
                            title="Sair da conta"
                            onClick={handleLogout}
                            className={logoutButtonClass}
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                            <span className="hidden lg:inline">Sair</span>
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" title="Entrar" className={getSidebarNavLinkClass}>
                        <ArrowRightOnRectangleIcon className="h-6 w-6 flex-shrink-0 lg:mr-3" />
                        <span className="hidden lg:inline">Entrar</span>
                    </NavLink>
                )}
            </div>
        </div>
    );
}

export default SidebarNav;