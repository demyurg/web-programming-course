// src/components/Auth/useAuth.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { useCallback, useEffect } from 'react';
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription';
import { getApiAuthGithubCallback } from '../../../generated/api/auth/auth';

export const useAuth = () => {
  const { isLoading, data: token, setValue } = useLocalStorageWithSubscription('auth_token');

  useEffect(() => {
    const processGitHubCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        console.log('🔐 Processing GitHub callback with code:', code.substring(0, 10) + '...');

        try {
          // Получаем токен от сервера
          const response = await getApiAuthGithubCallback({ code });

          if (response.token) {
            // Сохраняем токен
            setValue(response.token);

            // Очищаем URL от параметра code
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);

            console.log('✅ Authentication successful');
          } else {
            console.error('❌ No token in response:', response);
          }
        } catch (error) {
          console.error('❌ Authentication error:', error);

          // Даже при ошибке очищаем URL
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    };

    processGitHubCallback();
  }, [setValue]);

  const login = useCallback(() => {
    const env = (import.meta as any).env;
    const clientId = env.VITE_GITHUB_CLIENT_ID || 'Ov23liELvyQUKMmRdXlw';

    const redirectUri = env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5173/';

    const scope = 'user:email';


    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);

    const encodedRedirectUri = encodeURIComponent(redirectUri);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&scope=${scope}&state=${state}`;

    console.log('🔗 Redirecting to GitHub:', {
      clientId,
      redirectUri,
      authUrl: githubAuthUrl
    });

    window.location.href = githubAuthUrl;
    
  }, []);

  const logout = useCallback(() => {
    console.log('👋 Logging out...');
    setValue(null);
    localStorage.removeItem('oauth_state');
  }, [setValue]);

  return { isLoading, login, logout, token };
};