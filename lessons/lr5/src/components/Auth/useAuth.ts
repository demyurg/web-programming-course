import { useCallback } from 'react'
import { useLocalStorageWithSubscription } from './useLocalStorageWithSubscription'
import { getApiAuthGithubCallback } from '../../../generated/api/auth/auth'

export const useAuth = () => {
	const {
		isLoading,
		data: token,
		setValue,
	} = useLocalStorageWithSubscription('auth_token') // Используем кастомный хук для работы с localStorage

	// Функция входа (login)
	const login = useCallback(async () => {
		const { token } = await getApiAuthGithubCallback({ code: '' })
		// Сохраняем полученный токен в localStorage
		setValue(token)
	}, [])

	const logout = useCallback(async () => {
		setValue(null)
	}, [])

	// Возвращаем значения, которые будут использовать компоненты
	return { isLoading, login, logout, token }
}
