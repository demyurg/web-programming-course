import { useCallback } from 'react';
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription';
import { getApiAuthGithubCallback } from '../generated/api/auth/auth';
// const getApiAuthGithubCallback = async (param: any) => {
//   return { token: 'mock-token' };
// };

export const userAuth = () => {
  const { isLoading, data: token, setValue } = useLocalStorageWithSubscription('auth_token');

  const login = useCallback(async () => {
    const { token } = await getApiAuthGithubCallback({ code: '' });
    setValue(token);
  }, []);

  const logout = useCallback(async () => {
    setValue(null);
  }, []);

  return { isLoading, login, logout, token };
};