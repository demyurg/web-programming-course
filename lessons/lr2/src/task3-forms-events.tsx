/**
 * Задание 3: Основы типизации форм и событий
 *
 * Цель: Научиться типизировать form события и создавать контролируемые компоненты
 *
 * Инструкции:
 * 1. Типизируйте event handlers
 * 2. Создайте простую валидацию
 * 3. Работайте с контролируемыми формами
 */

import { useState, useCallback, useEffect } from 'react'

// ===== BONUS 3: Универсальный хук useForm =====

interface UseFormOptions<T> {
	initialValues: T
	validationRules?: Partial<Record<keyof T, (value: any) => string | undefined>>
	onSubmit?: (values: T) => Promise<void> | void
	debounceMs?: number
}

interface UseFormReturn<T> {
	values: T
	errors: Partial<Record<keyof T, string>>
	isSubmitting: boolean
	isDirty: boolean
	isValid: boolean
	handleChange: (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => void
	handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	reset: () => void
	setFieldValue: (field: keyof T, value: any) => void
	setFieldError: (field: keyof T, error: string | undefined) => void
}

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value)
		}, delay)

		return () => {
			clearTimeout(handler)
		}
	}, [value, delay])

	return debouncedValue
}

function useForm<T extends Record<string, any>>({
	initialValues,
	validationRules = {},
	onSubmit,
	debounceMs = 300,
}: UseFormOptions<T>): UseFormReturn<T> {
	const [values, setValues] = useState<T>(initialValues)
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDirty, setIsDirty] = useState(false)

	const debouncedValues = useDebounce(values, debounceMs)

	// BONUS 1: Realtime валидация с debounce
	// ! без zod это полный ад
	useEffect(() => {
		if (!isDirty) return

		const newErrors: Partial<Record<keyof T, string>> = {}

		Object.keys(validationRules).forEach(key => {
			const fieldKey = key as keyof T
			const validator = validationRules[fieldKey]
			if (validator) {
				const error = validator(debouncedValues[fieldKey])
				if (error) {
					newErrors[fieldKey] = error
				}
			}
		})

		setErrors(newErrors)
	}, [debouncedValues, validationRules, isDirty])

	const isValid = Object.keys(errors).length === 0 && isDirty

	const handleChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const { name, value, type } = e.target

			setIsDirty(true)
			setValues(prev => ({
				...prev,
				[name]: type === 'number' ? parseFloat(value) || 0 : value,
			}))

			if (errors[name as keyof T]) {
				setErrors(prev => ({ ...prev, [name]: undefined }))
			}
		},
		[errors],
	)

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()

			if (!isValid || isSubmitting) return

			setIsSubmitting(true)
			try {
				await onSubmit?.(values)
			} catch (error) {
				console.error('Form submission error:', error)
			} finally {
				setIsSubmitting(false)
			}
		},
		[values, isValid, isSubmitting, onSubmit],
	)

	const reset = useCallback(() => {
		setValues(initialValues)
		setErrors({})
		setIsDirty(false)
		setIsSubmitting(false)
	}, [initialValues])

	const setFieldValue = useCallback((field: keyof T, value: any) => {
		setIsDirty(true)
		setValues(prev => ({ ...prev, [field]: value }))
	}, [])

	const setFieldError = useCallback(
		(field: keyof T, error: string | undefined) => {
			setErrors(prev => ({ ...prev, [field]: error }))
		},
		[],
	)

	return {
		values,
		errors,
		isSubmitting,
		isDirty,
		isValid,
		handleChange,
		handleSubmit,
		reset,
		setFieldValue,
		setFieldError,
	}
}

// ===== ЗАДАЧА 3.1: Простая форма пользователя =====

interface UserFormData {
	name: string
	email: string
	age: number
	message: string
}

const initialUserFormData: UserFormData = {
	name: '',
	email: '',
	age: 0,
	message: '',
}

const userValidationRules: Partial<
	Record<keyof UserFormData, (value: any) => string | undefined>
> = {
	name: (value: string) => {
		if (!value?.trim()) return 'Имя обязательно для заполнения'
		if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа'
		return undefined
	},
	email: (value: string) => {
		if (!value?.trim()) return 'Email обязателен для заполнения'
		if (!/\S+@\S+\.\S+/.test(value)) return 'Введите корректный email'
		return undefined
	},
	age: (value: number) => {
		if (value <= 0) return 'Возраст должен быть положительным числом'
		if (value > 150) return 'Введите реальный возраст'
		return undefined
	},
	message: (value: string) => {
		if (!value?.trim()) return 'Сообщение обязательно для заполнения'
		if (value.trim().length < 10)
			return 'Сообщение должно содержать минимум 10 символов'
		return undefined
	},
}

function UserForm(): JSX.Element {
	const [submitStatus, setSubmitStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle')

	const form = useForm<UserFormData>({
		initialValues: initialUserFormData,
		validationRules: userValidationRules,
		onSubmit: async data => {
			setSubmitStatus('idle')
			try {
				await new Promise(resolve => setTimeout(resolve, 2000))
				console.log('Форма отправлена:', data)
				setSubmitStatus('success')
				form.reset()
			} catch (error) {
				console.error('Ошибка при отправке формы', error)
				setSubmitStatus('error')
			}
		},
		debounceMs: 500,
	})

	return (
		<div className='user-form'>
			<h2>Форма пользователя (с real-time валидацией)</h2>

			<form onSubmit={form.handleSubmit}>
				<div className='form-group'>
					<label htmlFor='name'>Имя *</label>
					<input
						type='text'
						id='name'
						name='name'
						value={form.values.name}
						onChange={form.handleChange}
						disabled={form.isSubmitting}
						className={form.errors.name ? 'error' : ''}
					/>
					{form.errors.name && (
						<span className='error-message'>{form.errors.name}</span>
					)}
				</div>

				<div className='form-group'>
					<label htmlFor='email'>Email *</label>
					<input
						type='email'
						id='email'
						name='email'
						value={form.values.email}
						onChange={form.handleChange}
						disabled={form.isSubmitting}
						className={form.errors.email ? 'error' : ''}
					/>
					{form.errors.email && (
						<span className='error-message'>{form.errors.email}</span>
					)}
				</div>

				<div className='form-group'>
					<label htmlFor='age'>Возраст *</label>
					<input
						type='number'
						id='age'
						name='age'
						value={form.values.age === 0 ? '' : form.values.age}
						onChange={form.handleChange}
						disabled={form.isSubmitting}
						min='1'
						className={form.errors.age ? 'error' : ''}
					/>
					{form.errors.age && (
						<span className='error-message'>{form.errors.age}</span>
					)}
				</div>

				<div className='form-group'>
					<label htmlFor='message'>Сообщение *</label>
					<textarea
						id='message'
						name='message'
						value={form.values.message}
						onChange={form.handleChange}
						disabled={form.isSubmitting}
						rows={4}
						className={form.errors.message ? 'error' : ''}
					/>
					{form.errors.message && (
						<span className='error-message'>{form.errors.message}</span>
					)}
				</div>

				<div className='form-actions'>
					<button type='submit' disabled={form.isSubmitting || !form.isValid}>
						{form.isSubmitting ? 'Отправка...' : 'Отправить'}
					</button>
					<button
						type='button'
						onClick={form.reset}
						disabled={form.isSubmitting}
					>
						Сбросить
					</button>
				</div>

				{submitStatus === 'success' && (
					<div className='success-message'>Форма отправлена успешно!</div>
				)}
				{submitStatus === 'error' && (
					<div className='error-message'>Произошла ошибка при отправке</div>
				)}
			</form>

			<div className='form-debug'>
				<details>
					<summary>Debug Info</summary>
					<pre>
						{JSON.stringify(
							{
								values: form.values,
								errors: form.errors,
								isDirty: form.isDirty,
								isValid: form.isValid,
							},
							null,
							2,
						)}
					</pre>
				</details>
			</div>
		</div>
	)
}

// ===== ЗАДАЧА 3.2: Расширенная форма поиска =====

interface AdvancedSearchData {
	query: string
	category: 'all' | 'tech' | 'design' | 'business' | 'science'
	dateFrom: string
	dateTo: string
	sortBy: 'relevance' | 'date' | 'title' | 'price'
	sortOrder: 'asc' | 'desc'
	minPrice: number
	maxPrice: number
	tags: string[]
	isActive: boolean
}

const initialSearchData: AdvancedSearchData = {
	query: '',
	category: 'all',
	dateFrom: '',
	dateTo: '',
	sortBy: 'relevance',
	sortOrder: 'desc',
	minPrice: 0,
	maxPrice: 1000,
	tags: [],
	isActive: true,
}

function AdvancedSearchForm(): JSX.Element {
	const [searchData, setSearchData] =
		useState<AdvancedSearchData>(initialSearchData)
	const [searchResults, setSearchResults] = useState<any[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [availableTags] = useState([
		'react',
		'typescript',
		'design',
		'ux',
		'api',
		'database',
	])

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const { name, value, type } = e.target

			if (type === 'checkbox') {
				const checked = (e.target as HTMLInputElement).checked
				setSearchData(prev => ({ ...prev, [name]: checked }))
			} else if (type === 'number') {
				setSearchData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
			} else {
				setSearchData(prev => ({ ...prev, [name]: value }))
			}
		},
		[],
	)

	const handleTagToggle = useCallback((tag: string) => {
		setSearchData(prev => ({
			...prev,
			tags: prev.tags.includes(tag)
				? prev.tags.filter(t => t !== tag)
				: [...prev.tags, tag],
		}))
	}, [])

	const handleSearch = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			setIsSearching(true)

			try {
				await new Promise(resolve => setTimeout(resolve, 1000))

				const mockResults = [
					{
						id: 1,
						title: 'React Tutorial',
						category: 'tech',
						date: '2025-01-01',
						price: 0,
						tags: ['react'],
					},
					{
						id: 2,
						title: 'Design Principles',
						category: 'design',
						date: '2025-01-01',
						price: 500,
						tags: ['design', 'ux'],
					},
					{
						id: 3,
						title: 'TypeScript Guide',
						category: 'tech',
						date: '2025-01-01',
						price: 250,
						tags: ['typescript'],
					},
				].filter(item => {
					if (
						searchData.category !== 'all' &&
						item.category !== searchData.category
					)
						return false
					if (
						searchData.query &&
						!item.title.toLowerCase().includes(searchData.query.toLowerCase())
					)
						return false
					if (
						searchData.minPrice > item.price ||
						searchData.maxPrice < item.price
					)
						return false
					if (
						searchData.tags.length > 0 &&
						!searchData.tags.some(tag => item.tags.includes(tag))
					)
						return false
					return true
				})

				mockResults.sort((a, b) => {
					let comparison = 0
					switch (searchData.sortBy) {
						case 'date':
							comparison =
								new Date(a.date).getTime() - new Date(b.date).getTime()
							break
						case 'title':
							comparison = a.title.localeCompare(b.title)
							break
						case 'price':
							comparison = a.price - b.price
							break
						default:
							comparison = 0
					}
					return searchData.sortOrder === 'desc' ? -comparison : comparison
				})

				setSearchResults(mockResults)
			} catch (error) {
				console.error('Search error:', error)
			} finally {
				setIsSearching(false)
			}
		},
		[searchData],
	)

	const resetFilters = useCallback(() => {
		setSearchData(initialSearchData)
		setSearchResults([])
	}, [])

	return (
		<div className='advanced-search-form'>
			<h2>Расширенный поиск</h2>

			<form onSubmit={handleSearch}>
				<div className='search-row'>
					<div className='form-group'>
						<label htmlFor='query'>Поисковый запрос</label>
						<input
							type='text'
							id='query'
							name='query'
							value={searchData.query}
							onChange={handleInputChange}
							placeholder='Введите запрос...'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='category'>Категория</label>
						<select
							id='category'
							name='category'
							value={searchData.category}
							onChange={handleInputChange}
						>
							<option value='all'>Все категории</option>
							<option value='tech'>Технологии</option>
							<option value='design'>Дизайн</option>
							<option value='business'>Бизнес</option>
							<option value='science'>Наука</option>
						</select>
					</div>
				</div>

				<div className='search-row'>
					<div className='form-group'>
						<label htmlFor='dateFrom'>Дата от</label>
						<input
							type='date'
							id='dateFrom'
							name='dateFrom'
							value={searchData.dateFrom}
							onChange={handleInputChange}
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='dateTo'>Дата до</label>
						<input
							type='date'
							id='dateTo'
							name='dateTo'
							value={searchData.dateTo}
							onChange={handleInputChange}
						/>
					</div>
				</div>

				<div className='search-row'>
					<div className='form-group'>
						<label htmlFor='sortBy'>Сортировка</label>
						<select
							id='sortBy'
							name='sortBy'
							value={searchData.sortBy}
							onChange={handleInputChange}
						>
							<option value='relevance'>По релевантности</option>
							<option value='date'>По дате</option>
							<option value='title'>По названию</option>
							<option value='price'>По цене</option>
						</select>
					</div>

					<div className='form-group'>
						<label htmlFor='sortOrder'>Порядок</label>
						<select
							id='sortOrder'
							name='sortOrder'
							value={searchData.sortOrder}
							onChange={handleInputChange}
						>
							<option value='desc'>По убыванию</option>
							<option value='asc'>По возрастанию</option>
						</select>
					</div>
				</div>

				<div className='search-row'>
					<div className='form-group'>
						<label htmlFor='minPrice'>Мин. цена</label>
						<input
							type='number'
							id='minPrice'
							name='minPrice'
							value={searchData.minPrice}
							onChange={handleInputChange}
							min='0'
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='maxPrice'>Макс. цена</label>
						<input
							type='number'
							id='maxPrice'
							name='maxPrice'
							value={searchData.maxPrice}
							onChange={handleInputChange}
							min='0'
						/>
					</div>
				</div>

				<div className='form-group'>
					<label>Теги</label>
					<div className='tags-container'>
						{availableTags.map(tag => (
							<label key={tag} className='tag-label'>
								<input
									type='checkbox'
									checked={searchData.tags.includes(tag)}
									onChange={() => handleTagToggle(tag)}
								/>
								{tag}
							</label>
						))}
					</div>
				</div>

				<div className='form-group'>
					<label className='checkbox-label'>
						<input
							type='checkbox'
							name='isActive'
							checked={searchData.isActive}
							onChange={handleInputChange}
						/>
						Только активные
					</label>
				</div>

				<div className='form-actions'>
					<button type='submit' disabled={isSearching}>
						{isSearching ? 'Поиск...' : 'Найти'}
					</button>
					<button type='button' onClick={resetFilters}>
						Сбросить фильтры
					</button>
				</div>
			</form>

			<div className='search-results'>
				<h3>Результаты поиска ({searchResults.length})</h3>
				{searchResults.length > 0 ? (
					<div className='results-list'>
						{searchResults.map(result => (
							<div key={result.id} className='result-item'>
								<h4>{result.title}</h4>
								<p>Категория: {result.category}</p>
								<p>Дата: {result.date}</p>
								<p>Цена: {result.price}</p>
								<p>Теги: {result.tags.join(', ')}</p>
							</div>
						))}
					</div>
				) : (
					<p>Результаты не найдены</p>
				)}

				<details>
					<summary>Debug Info</summary>
					<pre>{JSON.stringify(searchData, null, 2)}</pre>
				</details>
			</div>
		</div>
	)
}

// ===== Простая форма поиска =====

interface SearchData {
	query: string
	category: 'all' | 'tech' | 'design'
}

function SearchForm(): JSX.Element {
	const [searchData, setSearchData] = useState<SearchData>({
		query: '',
		category: 'all',
	})

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const { name, value } = e.target
			setSearchData(prev => ({
				...prev,
				[name as keyof SearchData]: value,
			}))
		},
		[],
	)

	const handleSearch = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()
			console.log('Поиск:', searchData)
		},
		[searchData],
	)

	return (
		<div className='search-form'>
			<h2>Простой поиск</h2>

			<form onSubmit={handleSearch}>
				<div className='form-group'>
					<label htmlFor='query'>Поиск</label>
					<input
						type='text'
						id='query'
						name='query'
						value={searchData.query}
						onChange={handleInputChange}
						placeholder='Введите запрос...'
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='category'>Категория</label>
					<select
						id='category'
						name='category'
						value={searchData.category}
						onChange={handleInputChange}
					>
						<option value='all'>Все</option>
						<option value='tech'>Технологии</option>
						<option value='design'>Дизайн</option>
					</select>
				</div>

				<button type='submit'>Поиск</button>
			</form>

			<div className='search-results'>
				<pre>{JSON.stringify(searchData, null, 2)}</pre>
			</div>
		</div>
	)
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

function App(): JSX.Element {
	const [activeForm, setActiveForm] = useState<'user' | 'search' | 'advanced'>(
		'user',
	)

	const handleUserFormClick = useCallback(() => {
		setActiveForm('user')
	}, [])

	const handleSearchFormClick = useCallback(() => {
		setActiveForm('search')
	}, [])

	const handleAdvancedSearchClick = useCallback(() => {
		setActiveForm('advanced')
	}, [])

	return (
		<div className='app'>
			<nav className='form-nav'>
				<button
					className={activeForm === 'user' ? 'active' : ''}
					onClick={handleUserFormClick}
				>
					Форма пользователя
				</button>
				<button
					className={activeForm === 'search' ? 'active' : ''}
					onClick={handleSearchFormClick}
				>
					Простой поиск
				</button>
				<button
					className={activeForm === 'advanced' ? 'active' : ''}
					onClick={handleAdvancedSearchClick}
				>
					Расширенный поиск
				</button>
			</nav>

			<div className='form-content'>
				{activeForm === 'user' && <UserForm />}
				{activeForm === 'search' && <SearchForm />}
				{activeForm === 'advanced' && <AdvancedSearchForm />}
			</div>
		</div>
	)
}

export default App
