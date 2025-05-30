// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor (AuthProvider Component)
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // Pode armazenar dados do usuário como { id, name, email }

    // Função de login simulada
    const login = (userData) => {
        // Em uma aplicação real, aqui você faria uma chamada à API,
        // receberia um token, dados do usuário, etc.
        setUser(userData); // Ex: { id: '1', name: 'Usuário Teste', email: userData.email }
        setIsAuthenticated(true);
        console.log('Usuário logado (simulado):', userData);
    };

    // Função de logout simulada
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        console.log('Usuário deslogado (simulado)');
    };

    // Valor que será fornecido pelo Contexto
    const value = {
        isAuthenticated,
        user,
        login, // exporta a função de login
        logout // exporta a função de logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Criar um Hook customizado para usar o AuthContext (opcional, mas recomendado)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    if (context === null) {
        // Isso pode acontecer se o valor inicial do createContext for null e o provider ainda não envolveu
        // os componentes. Com a estrutura atual do AuthProvider, isso é menos provável de ser um problema
        // prático, mas a checagem é uma boa prática.
        throw new Error('AuthProvider não parece estar envolvendo os componentes corretamente ou o valor do contexto é null.');
    }
    return context;
};