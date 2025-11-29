import { useCallback } from 'react'
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription'
import { getApiAuthGithubCallback } from '../generated/api/auth/auth'

export const userAuth = () => {
  const {
    isLoading,
    data: token,
    setValue,
  } = useLocalStorageWithSubscription('auth_token')

  const login = useCallback(async () => {
    try {
      const response = await getApiAuthGithubCallback({ code: 'mock_code' })
      setValue(response.token)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }, [setValue])

  const logout = useCallback(async () => {
    setValue(null)
  }, [setValue])

  return { isLoading, login, logout, token }
}
