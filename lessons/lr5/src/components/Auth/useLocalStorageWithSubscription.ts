import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

// Кастомный хук для работы с localStorage с подпиской на изменения
export const useLocalStorageWithSubscription = <T>(key: string) => {
	const queryClient = useQueryClient() // Получаем клиент TanStack Query

	// Функция для установки значения в localStorage и в кэш React Query
	const setValue = useCallback((value: null | string) => {
		queryClient.setQueryData(['localStorage', key], value)
		if (value) {
			localStorage.setItem(key, value)
		} else {
			localStorage.removeItem(key)
		}
	}, [])

	// Подписка на изменения localStorage
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === key) {
				setValue(event.newValue)
			}
		}

		// Подписываемся на событие изменения localStorage
		window.addEventListener('storage', handleStorageChange)
		return () => {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [key, queryClient])

	// Возвращаем результат запроса + функцию изменения значения
	return {
		...useQuery({
			queryKey: ['localStorage', key],
			queryFn: () => {
				const item = localStorage.getItem(key)
				if (item === null) {
					return null
				}
				try {
					return JSON.parse(item) as T
				} catch {
					return item as T
				}
			},
			staleTime: Infinity,
			retry: false,
		}),
		setValue,
	}
}
