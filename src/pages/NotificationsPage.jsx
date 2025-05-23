// src/pages/NotificationsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HeartIcon, 
    ChatBubbleLeftEllipsisIcon, 
    UserPlusIcon,
    InformationCircleIcon,
    BellIcon 
} from '@heroicons/react/24/solid';

const getNotificationStyledIcon = (type, darkMode) => { // Adicionada prop darkMode
  // Ajustar a cor do ícone com base no tema
  const iconColorClass = darkMode ? "text-ollo-accent-light" : "text-ollo-deep"; 
  const iconSizeClass = "h-5 w-5";
  const commonClasses = `${iconSizeClass} ${iconColorClass}`;

  switch (type) {
    case 'like':
      return <HeartIcon className={commonClasses} />;
    case 'comment':
      return <ChatBubbleLeftEllipsisIcon className={commonClasses} />;
    case 'follow':
      return <UserPlusIcon className={commonClasses} />;
    case 'system':
      return <InformationCircleIcon className={commonClasses} />;
    default:
      return <BellIcon className={commonClasses} />;
  }
};

// NotificationsPage agora recebe a prop darkMode
function NotificationsPage({ darkMode }) { 
  const navigate = useNavigate(); 

  const initialNotificationsData = [
    { id: 1, type: 'like', user: 'Usuário OLLO', target: 'seu post "Explorando OLLO"', timestamp: '5m atrás', postId: 'ollo-exploration', unread: true },
    { id: 2, type: 'comment', user: 'Dev Entusiasta', target: 'seu post "Minhas Ideias"', text: 'Excelente ponto de vista! Concordo totalmente.', timestamp: '1h atrás', postId: 'my-ideas-post', unread: false },
    { id: 3, type: 'follow', user: 'Gemini Auxiliar', timestamp: '3h atrás', profileId: 'gemini-aux', unread: true },
    { id: 4, type: 'like', user: 'Designer Criativo', target: 'sua foto de perfil', timestamp: 'ontem', profileId: 'meu-perfil', unread: false },
    { id: 5, type: 'comment', user: 'Marketing Digital', target: 'seu post "Explorando OLLO"', text: 'Adorei a plataforma! Como posso colaborar?', timestamp: 'ontem', postId: 'ollo-exploration', unread: true },
    { id: 6, type: 'system', user: 'Plataforma OLLO', target: 'Novos Termos de Serviço', text: 'Atualizamos nossos termos, confira as novidades.', timestamp: '2 dias atrás', link: '/terms', unread: false}
  ];
  
  const [notifications, setNotifications] = useState(initialNotificationsData);

  const handleNotificationClick = (clickedNotification) => {
    let destination = null; 

    if (clickedNotification.postId) {
      destination = `/posts/${clickedNotification.postId}`; 
      console.log(`INFO: Tentando navegar para o post ID: ${clickedNotification.postId} (Destino: ${destination})`);
    } else if (clickedNotification.profileId) {
      destination = `/profile/${clickedNotification.profileId}`;
      console.log(`INFO: Tentando navegar para o perfil ID: ${clickedNotification.profileId} (Destino: ${destination})`);
    } else if (clickedNotification.link) { 
      destination = clickedNotification.link;
      console.log(`INFO: Tentando navegar para o link: ${clickedNotification.link} (Destino: ${destination})`);
    }

    if (destination) {
      navigate(destination); 
    } else {
      console.warn('AVISO: Nenhuma ação de navegação definida ou destino válido para esta notificação:', clickedNotification);
    }
    
    if (clickedNotification.unread) {
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === clickedNotification.id ? { ...n, unread: false } : n
        )
      );
    }
  };

  // Define as classes de texto principal com base no tema
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-700';
  const userColor = darkMode ? 'text-ollo-bg-light hover:underline' : 'text-ollo-deep hover:underline';
  const timestampColorUnread = darkMode ? 'text-ollo-accent-light font-medium' : 'text-ollo-deep font-medium';
  const timestampColorRead = darkMode ? 'text-gray-400' : 'text-gray-500';
  const targetTextColor = darkMode ? 'text-gray-300' : 'text-gray-600';
  
  // Define as classes de fundo e borda do card de notificação com base no tema
  const unreadCardClasses = darkMode 
    ? 'bg-gray-800 hover:bg-gray-700/80 border-ollo-accent-light' 
    : 'bg-white hover:bg-gray-50/80 border-ollo-accent-light'; // Borda ollo-accent-light para não lidas em ambos os temas
  
  const readCardClasses = darkMode 
    ? 'bg-gray-800/50 hover:bg-gray-700/70 border-gray-700' // Um pouco mais sutil para lidas no modo escuro
    : 'bg-white/70 hover:bg-gray-50/70 border-gray-300'; // Fundo branco/translúcido para lidas no modo claro

  const iconContainerUnreadClasses = darkMode ? 'bg-ollo-accent-light/10' : 'bg-ollo-accent-light/20';
  const iconContainerReadClasses = darkMode ? 'bg-gray-700/60' : 'bg-gray-200/70';

  return (
    // O fundo da página agora é controlado pelo MainLayout (gradiente claro)
    // ou pelo App.jsx (se darkMode for true -> bg-gray-950)
    // Este div é apenas para espaçamento e largura máxima.
    <div className="min-h-full py-8 sm:py-12"> 
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 tracking-tight text-center ${darkMode ? 'text-ollo-accent-light' : 'text-ollo-deep'}`}>
          Notificações
        </h1>
        <div className="space-y-3 sm:space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`
                  rounded-xl shadow-lg /* Para melhor visibilidade em fundos claros */
                  transition-all duration-200 ease-in-out cursor-pointer 
                  border-l-4 
                  flex items-start space-x-3 sm:space-x-4 p-4 
                  ${notif.unread ? unreadCardClasses : readCardClasses}
                `}
              >
                <div className={`flex-shrink-0 mt-0.5 p-2 rounded-full ${notif.unread ? iconContainerUnreadClasses : iconContainerReadClasses}`}>
                  {getNotificationStyledIcon(notif.type, darkMode)} {/* Passa darkMode para o ícone */}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${textColor} leading-relaxed`}>
                    <span className={`font-semibold ${userColor}`}>{notif.user}</span>
                    {notif.type === 'like' && ` curtiu ${notif.target}.`}
                    {notif.type === 'comment' && <> comentou em {notif.target}: <span className={`italic ${targetTextColor}`}>"{notif.text}"</span></>}
                    {notif.type === 'follow' && ` começou a seguir você.`}
                    {notif.type === 'system' && <> <span className="font-semibold">{notif.target}</span> <span className={targetTextColor}>{notif.text}</span></>}
                  </p>
                  <p className={`text-xs ${notif.unread ? timestampColorUnread : timestampColorRead} mt-1`}>
                    {notif.timestamp}
                  </p>
                </div>
              </div>
            ))
          ) : (
            // Mensagem "Nenhuma notificação" sem card de fundo
            <div className={`text-center py-16 px-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <BellIcon className={`mx-auto h-16 w-16 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tudo Limpo por Aqui!</h3>
              <p>Você não tem nenhuma notificação nova no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default NotificationsPage;