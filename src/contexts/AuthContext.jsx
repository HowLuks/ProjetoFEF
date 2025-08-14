import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDemoData } from '../utils/demoData';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carregar dados de demonstração
        loadDemoData();
        
        // Verificar se há usuário logado
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem('vendedores')) || [];
        const foundUser = users.find(user => user.username === username && user.password === password);
        
        if (foundUser) {
            setCurrentUser(foundUser);
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const value = {
        currentUser,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

