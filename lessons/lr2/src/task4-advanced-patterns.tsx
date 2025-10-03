/**
 * Задание 4: Современные паттерны React + TypeScript
 *
 * Цель: Освоить современные паттерны: Context + hooks, Custom hooks, Compound Components
 *
 * Инструкции:
 * 1. Создайте типизированные Context и хуки
 * 2. Реализуйте простые Compound Components
 * 3. Создайте custom hooks для переиспользования
 */

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	ReactNode,
} from 'react'

// useLocalStorage from task2
function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue
		}
		try {
			const item = window.localStorage.getItem(key)
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			console.error(error)
			return initialValue
		}
	})

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value
			setStoredValue(valueToStore)
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(valueToStore))
			}
		} catch (error) {
			console.error(error)
		}
	}

	return [storedValue, setValue]
}

// ===== ЗАДАЧА 4.1: Типизированные Context и хуки =====

// TODO: Определите интерфейс User
interface User {
	id: number
	name: string
	email: string
	role: 'admin' | 'user' | 'guest'
}

// TODO: Определите тип для UserContext
interface UserContextType {
	user: User | null
	login: (user: User) => void
	logout: () => void
	isLoggedIn: boolean
}

// TODO: Создайте типизированный Context
const UserContext = createContext<UserContextType | undefined>(undefined)

// TODO: Типизируйте UserProvider
function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useLocalStorage<User | null>('user', null)

	const login = useCallback(
		(userData: User) => {
			// TODO: реализуйте логику входа
			setUser(userData)
		},
		[setUser],
	)

	const logout = useCallback(() => {
		// TODO: реализуйте логику выхода
		setUser(null)
	}, [setUser])

	const isLoggedIn = user !== null

	const value: UserContextType = {
		user,
		login,
		logout,
		isLoggedIn,
	}

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// TODO: Создайте кастомный хук useUser
function useUser(): UserContextType {
	const context = useContext(UserContext)

	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}

	return context
}

// ===== BONUS 1: Theme Context =====

type Theme = 'light' | 'dark'

interface ThemeContextType {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light')

	const toggleTheme = useCallback(() => {
		setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
	}, [setTheme])

	const value: ThemeContextType = {
		theme,
		toggleTheme,
	}

	return (
		<ThemeContext.Provider value={value}>
			<div className={`app-theme-${theme}`}>{children}</div>
		</ThemeContext.Provider>
	)
}

function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext)

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}

	return context
}

// ===== ЗАДАЧА 4.2: Простые Compound Components =====

// TODO: Создайте простой Card компонент с compound паттерном

// TODO: Определите интерфейсы для Card
interface CardProps {
	children: ReactNode
	className?: string
}

interface CardHeaderProps {
	children: ReactNode
}

interface CardContentProps {
	children: ReactNode
}

interface CardFooterProps {
	children: ReactNode
}

// TODO: Реализуйте основной компонент Card
function Card({ children, className }: CardProps) {
	return <div className={`card ${className || ''}`}>{children}</div>
}

// TODO: Реализуйте Card.Header
const CardHeader = ({ children }: CardHeaderProps) => {
	return <div className='card-header'>{children}</div>
}

// TODO: Реализуйте Card.Content
const CardContent = ({ children }: CardContentProps) => {
	return <div className='card-content'>{children}</div>
}

// TODO: Реализуйте Card.Footer
const CardFooter = ({ children }: CardFooterProps) => {
	return <div className='card-footer'>{children}</div>
}

// TODO: Присоедините compound components к Card
Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

// ===== BONUS 3: Tabs Compound Component =====

interface TabsProps {
	children: ReactNode
	defaultTab?: string
}

interface TabListProps {
	children: ReactNode
}

interface TabProps {
	children: ReactNode
	tabKey: string
}

interface TabPanelsProps {
	children: ReactNode
}

interface TabPanelProps {
	children: ReactNode
	tabKey: string
}

interface TabsContextType {
	activeTab: string
	setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

function useTabs(): TabsContextType {
	const context = useContext(TabsContext)
	if (!context) {
		throw new Error('Tab components must be used within Tabs')
	}
	return context
}

function Tabs({ children, defaultTab = '' }: TabsProps) {
	const [activeTab, setActiveTab] = useLocalStorage('activeTab', defaultTab)

	const value: TabsContextType = {
		activeTab,
		setActiveTab,
	}

	return (
		<TabsContext.Provider value={value}>
			<div className='tabs'>{children}</div>
		</TabsContext.Provider>
	)
}

const TabList = ({ children }: TabListProps) => {
	return <div className='tab-list'>{children}</div>
}

const Tab = ({ children, tabKey }: TabProps) => {
	const { activeTab, setActiveTab } = useTabs()
	const isActive = activeTab === tabKey

	return (
		<button
			className={`tab ${isActive ? 'active' : ''}`}
			onClick={() => setActiveTab(tabKey)}
		>
			{children}
		</button>
	)
}

const TabPanels = ({ children }: TabPanelsProps) => {
	return <div className='tab-panels'>{children}</div>
}

const TabPanel = ({ children, tabKey }: TabPanelProps) => {
	const { activeTab } = useTabs()

	if (activeTab !== tabKey) {
		return null
	}

	return <div className='tab-panel'>{children}</div>
}

Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panels = TabPanels
Tabs.Panel = TabPanel

// ===== ЗАДАЧА 4.3: Custom Hooks =====

// TODO: Создайте custom hook useCounter
function useCounter(initialValue = 0) {
	const [count, setCount] = useLocalStorage('counter', initialValue)

	const increment = useCallback(() => {
		// TODO: реализуйте увеличение
		setCount(prev => prev + 1)
	}, [setCount])

	const decrement = useCallback(() => {
		// TODO: реализуйте уменьшение
		setCount(prev => prev - 1)
	}, [setCount])

	const reset = useCallback(() => {
		// TODO: реализуйте сброс
		setCount(initialValue)
	}, [initialValue, setCount])

	return { count, increment, decrement, reset }
}

// TODO: Создайте custom hook useToggle
function useToggle(initialValue = false, storageKey?: string) {
	const [value, setValue] = storageKey
		? useLocalStorage(storageKey, initialValue)
		: useState(initialValue)

	const toggle = useCallback(() => {
		// TODO: реализуйте переключение
		setValue(prev => !prev)
	}, [setValue])

	return [value, toggle] as const
}

// ===== ЗАДАЧА 4.4: Пример демо приложения =====

// TODO: Создайте демо компонент с использованием всех паттернов
const Demo = () => {
	const { user, login, logout, isLoggedIn } = useUser()
	const { count, increment, decrement, reset } = useCounter(0)
	const [isVisible, toggleVisible] = useToggle(false, 'cardVisibility')
	const { theme, toggleTheme } = useTheme()

	return (
		<div className='demo'>
			<h1>Демо приложение</h1>

			{/* Theme switcher */}
			<div className='theme-section'>
				<h2>Тема</h2>
				<p>Текущая тема: {theme}</p>
				<button onClick={toggleTheme}>
					Переключить на {theme === 'light' ? 'темную' : 'светлую'}
				</button>
			</div>

			{/* TODO: Пример Context + hooks */}
			<div className='user-section'>
				<h2>Пользователь</h2>
				{isLoggedIn ? (
					<div>
						<p>Привет, {user?.name}!</p>
						<button onClick={logout}>Выйти</button>
					</div>
				) : (
					<button
						onClick={() =>
							login({
								id: 1,
								name: 'Иван Иванов',
								email: 'ivan@example.com',
								role: 'user',
							})
						}
					>
						Войти
					</button>
				)}
			</div>

			{/* TODO: Пример custom hooks */}
			<div className='counter-section'>
				<h2>Счетчик: {count}</h2>
				<button onClick={increment}>+</button>
				<button onClick={decrement}>-</button>
				<button onClick={reset}>Сброс</button>
			</div>

			{/* TODO: Пример compound components */}
			<div className='card-section'>
				<Card className='demo-card'>
					<Card.Header>
						<h3>Пример карточки</h3>
						<button onClick={toggleVisible}>
							{isVisible ? 'Скрыть' : 'Показать'}
						</button>
					</Card.Header>
					<Card.Content>
						{isVisible && <p>Содержимое карточки стало видимым!</p>}
					</Card.Content>
					<Card.Footer>
						<small>Подвал карточки</small>
					</Card.Footer>
				</Card>
			</div>

			{/* Пример Tabs compound component */}
			<div className='tabs-section'>
				<h2>Табы</h2>
				<Tabs defaultTab='tab1'>
					<Tabs.List>
						<Tabs.Tab tabKey='tab1'>Таб 1</Tabs.Tab>
						<Tabs.Tab tabKey='tab2'>Таб 2</Tabs.Tab>
						<Tabs.Tab tabKey='tab3'>Таб 3</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panels>
						<Tabs.Panel tabKey='tab1'>
							<p>Содержимое первого таба</p>
						</Tabs.Panel>
						<Tabs.Panel tabKey='tab2'>
							<p>Содержимое второго таба</p>
						</Tabs.Panel>
						<Tabs.Panel tabKey='tab3'>
							<p>Содержимое третьего таба</p>
						</Tabs.Panel>
					</Tabs.Panels>
				</Tabs>
			</div>
		</div>
	)
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

// TODO: Типизируйте App компонент
const App: React.FC = () => {
	return (
		<ThemeProvider>
			<UserProvider>
				<div className='app'>
					<Demo />
				</div>
			</UserProvider>
		</ThemeProvider>
	)
}

export default App

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// TODO BONUS 1: Добавьте Theme Context с переключением светлой/темной темы
// TODO BONUS 2: Создайте useLocalStorage hook для сохранения данных
// TODO BONUS 3: Реализуйте более сложные Compound Components (например, Tabs)
