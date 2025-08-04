// src/pages/NotificationsPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  UserPlusIcon,
  InformationCircleIcon,
  BellIcon,
} from '@heroicons/react/24/solid';

// A função do ícone agora não precisa mais do prop 'darkMode'
const getNotificationStyledIcon = (type) => {
  // As cores são controladas pelas classes do Tailwind, não por lógica JS
  const commonClasses = 'h-5 w-5 text-ollo-deep dark:text-ollo-accent-light';

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

// O componente não precisa mais do prop 'darkMode'
function NotificationsPage() {
  const navigate = useNavigate();

  const initialNotificationsData = [
    {
      id: 1,
      type: 'like',
      user: 'Usuário OLLO',
      target: 'seu post "Explorando OLLO"',
      timestamp: '5m atrás',
      postId: 'ollo-exploration',
      unread: true,
    },
    {
      id: 2,
      type: 'comment',
      user: 'Dev Entusiasta',
      target: 'seu post "Minhas Ideias"',
      text: 'Excelente ponto de vista! Concordo totalmente.',
      timestamp: '1h atrás',
      postId: 'my-ideas-post',
      unread: false,
    },
    {
      id: 3,
      type: 'follow',
      user: 'Gemini Auxiliar',
      timestamp: '3h atrás',
      profileId: 'gemini-aux',
      unread: true,
    },
    {
      id: 4,
      type: 'like',
      user: 'Designer Criativo',
      target: 'sua foto de perfil',
      timestamp: 'ontem',
      profileId: 'meu-perfil',
      unread: false,
    },
    {
      id: 5,
      type: 'comment',
      user: 'Marketing Digital',
      target: 'seu post "Explorando OLLO"',
      text: 'Adorei a plataforma! Como posso colaborar?',
      timestamp: 'ontem',
      postId: 'ollo-exploration',
      unread: true,
    },
    {
      id: 6,
      type: 'system',
      user: 'Plataforma OLLO',
      target: 'Novos Termos de Serviço',
      text: 'Atualizamos nossos termos, confira as novidades.',
      timestamp: '2 dias atrás',
      link: '/terms',
      unread: false,
    },
  ];

  const [notifications, setNotifications] = useState(initialNotificationsData);

  const handleNotificationClick = (clickedNotification) => {
    let destination = null;
    if (clickedNotification.postId)
      destination = `/posts/${clickedNotification.postId}`;
    else if (clickedNotification.profileId)
      destination = `/profile/${clickedNotification.profileId}`;
    else if (clickedNotification.link) destination = clickedNotification.link;

    if (destination) navigate(destination);

    if (clickedNotification.unread) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === clickedNotification.id ? { ...n, unread: false } : n
        )
      );
    }
  };

  return (
    <div className="min-h-full py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 tracking-tight text-center text-ollo-deep dark:text-ollo-accent-light">
          Notificações
        </h1>
        <div className="space-y-3 sm:space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`
                  rounded-xl shadow-lg transition-all duration-200 ease-in-out cursor-pointer 
                  border-l-4 flex items-start space-x-3 sm:space-x-4 p-4
                  ${
                    notif.unread
                      ? 'bg-white hover:bg-gray-50/80 border-ollo-accent-light dark:bg-gray-800 dark:hover:bg-gray-700/80'
                      : 'bg-white/70 hover:bg-gray-50/70 border-gray-300 dark:bg-gray-800/50 dark:hover:bg-gray-700/70 dark:border-gray-700'
                  }
                `}
              >
                <div
                  className={`flex-shrink-0 mt-0.5 p-2 rounded-full 
                              ${
                                notif.unread
                                  ? 'bg-ollo-accent-light/20 dark:bg-ollo-accent-light/10'
                                  : 'bg-gray-200/70 dark:bg-gray-700/60'
                              }`}
                >
                  {getNotificationStyledIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-100 leading-relaxed">
                    <span className="font-semibold text-ollo-deep dark:text-white hover:underline">
                      {notif.user}
                    </span>
                    {notif.type === 'like' && ` curtiu ${notif.target}.`}
                    {notif.type === 'comment' && (
                      <>
                        {' '}
                        comentou em {notif.target}:{' '}
                        <span className="italic text-gray-600 dark:text-gray-300">
                          "{notif.text}"
                        </span>
                      </>
                    )}
                    {notif.type === 'follow' && ` começou a seguir você.`}
                    {notif.type === 'system' && (
                      <>
                        {' '}
                        <span className="font-semibold">
                          {notif.target}
                        </span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">
                          {notif.text}
                        </span>
                      </>
                    )}
                  </p>
                  <p
                    className={`text-xs mt-1 
                                ${
                                  notif.unread
                                    ? 'font-medium text-ollo-deep dark:text-ollo-accent-light'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                  >
                    {notif.timestamp}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 px-6 text-gray-400 dark:text-gray-500">
              <BellIcon className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Tudo Limpo por Aqui!
              </h3>
              <p>Você não tem nenhuma notificação nova no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
