import { useCallback } from 'react';
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription';

const getApiAuthGithubCallback = (param: any) => {
  return { token: 'mock-token' };
};

export const userAuth = () => {
  const { isLoading, data: token, setValue } = useLocalStorageWithSubscription('auth_token');

  const login = useCallback(() => {
    const { token } = getApiAuthGithubCallback({ code: '' });
    setValue(token);
  }, []);

  const logout = useCallback(async () => {
    setValue(null);
  }, []);

  return { isLoading, login, logout, token };
};
