import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [csrfToken, setCsrfToken] = useState(null);

    const fetchCsrf = useCallback(async () => {
        const { data } = await api.get('/auth/csrf');
        setCsrfToken(data.csrf_token);
        return data.csrf_token;
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
        fetchCsrf().catch(() => {});
    }, [refreshUser, fetchCsrf]);

    const csrfHeaders = useCallback(async () => {
        const token = csrfToken || (await fetchCsrf());
        return { headers: { 'X-CSRF-Token': token } };
    }, [csrfToken, fetchCsrf]);

    const signup = useCallback(
        async ({ email, password }) => {
            const headers = await csrfHeaders();
            await api.post('/auth/signup', { email, password }, headers);
            await refreshUser();
            setIsAuthModalOpen(false);
        },
        [csrfHeaders, refreshUser]
    );

    const login = useCallback(
        async ({ email, password }) => {
            const headers = await csrfHeaders();
            await api.post('/auth/login', { email, password }, headers);
            await refreshUser();
            setIsAuthModalOpen(false);
        },
        [csrfHeaders, refreshUser]
    );

    const logout = useCallback(async () => {
        await api.post('/auth/logout');
        setUser(null);
    }, []);

    const startOauth = useCallback((provider) => {
        window.location.href = `${API_BASE}/auth/oauth/${provider}/login`;
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthModalOpen,
            openAuthModal: () => setIsAuthModalOpen(true),
            closeAuthModal: () => setIsAuthModalOpen(false),
            signup,
            login,
            logout,
            startOauth,
        }),
        [user, loading, isAuthModalOpen, signup, login, logout, startOauth]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

