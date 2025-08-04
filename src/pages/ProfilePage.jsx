import React from 'react';
import Profile from '../components/pages/profile'; // index.jsx da pasta profile
import AuthWrapper from '../components/AuthWrapper';

// Garanta que AuthWrapper ainda funcione, protegendo a página
export default function ProfilePage(props) {
  return (
    <AuthWrapper>
      <Profile />
    </AuthWrapper>
  );
}
