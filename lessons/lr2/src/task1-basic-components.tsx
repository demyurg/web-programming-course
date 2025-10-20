/**
 * Задание 1: Базовые типизированные компоненты
 *
 * Цель: Научиться создавать простые типизированные React компоненты
 *
 * Инструкции:
 * 1. Создайте интерфейсы для всех props
 * 2. Добавьте правильную типизацию к компонентам
 * 3. Убедитесь что все компоненты работают без ошибок TypeScript
 */

import { forwardRef, useMemo, useState, useCallback } from 'react'

// ===== ЗАДАЧА 1.1: Простая карточка пользователя =====

interface UserCardProps {
	name: string
	email: string
	age?: number
	avatar?: string
	isOnline: boolean
}

function UserCard({ name, email, age, avatar, isOnline }: UserCardProps) {
	return (
		<div className='user-card'>
			{avatar && (
				<img src={avatar} alt={`${name}'s avatar`} className='avatar' />
			)}
			<h2>{name}</h2>
			<p>{email}</p>
			{age && <p>Возраст: {age}</p>}
			<span className={`status ${isOnline ? 'online' : 'offline'}`}>
				{isOnline ? 'онлайн' : 'офлайн'}
			</span>
		</div>
	)
}

// ===== ЗАДАЧА 1.2: Кнопка с вариантами =====

interface ButtonProps {
	children: React.ReactNode
	variant: 'primary' | 'secondary' | 'danger'
	size: 'small' | 'medium' | 'large'
	disabled?: boolean
	onClick: () => void
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, variant, size, disabled = false, onClick }, ref) => {
		return (
			<button
				ref={ref}
				className={`btn btn--${variant} btn--${size}`}
				disabled={disabled}
				onClick={onClick}
			>
				{children}
			</button>
		)
	},
)

Button.displayName = 'Button'

// ===== ЗАДАЧА 1.3: Простой список пользователей =====

interface UserListProps {
	users: string[]
	emptyMessage?: string
}

function UserList({
	users,
	emptyMessage = 'Нет пользователей',
}: UserListProps) {
	if (users.length === 0) {
		return <p>{emptyMessage}</p>
	}

	return (
		<ul className='user-list'>
			{users.map((user, index) => (
				<li key={index}>{user}</li>
			))}
		</ul>
	)
}

// ===== ЗАДАЧА 1.4: Карточка с children =====

interface CardProps {
	title: string
	children: React.ReactNode
	footer?: React.ReactNode
	className?: string
}

function Card({ title, children, footer, className }: CardProps) {
	return (
		<div className={`card ${className || ''}`}>
			<div className='card-header'>
				<h3>{title}</h3>
			</div>
			<div className='card-content'>{children}</div>
			{footer && <div className='card-footer'>{footer}</div>}
		</div>
	)
}

// ===== ЗАДАЧА 1.5: Демо компонент =====

interface User {
	id: number
	name: string
	email: string
	age: number
	isOnline: boolean
}

function App(): React.ReactElement {
	const [users, setUsers] = useState<User[]>([
		{
			id: 1,
			name: 'Анна Иванова',
			email: 'anna@example.com',
			age: 28,
			isOnline: true,
		},
		{
			id: 2,
			name: 'Петр Петров',
			email: 'petr@example.com',
			age: 35,
			isOnline: false,
		},
		{
			id: 3,
			name: 'Мария Сидорова',
			email: 'maria@example.com',
			age: 24,
			isOnline: true,
		},
	])

	const userNames = useMemo(() => users.map(user => user.name), [users])

	const handleAddUser = useCallback(() => {
		setUsers(prevUsers => [
			...prevUsers,
			{
				id:
					prevUsers.length > 0 ? Math.max(...prevUsers.map(u => u.id)) + 1 : 1,
				name: `Новый пользователь ${prevUsers.length + 1}`,
				email: `newuser${prevUsers.length + 1}@example.com`,
				age: 25,
				isOnline: false,
			},
		])
	}, [])

	return (
		<div className='app'>
			<Card
				title='Список пользователей'
				footer={<p>Всего пользователей: {users.length}</p>}
			>
				<UserList users={userNames} emptyMessage='Пользователей не найдено' />

				<div style={{ marginTop: '20px' }}>
					<Button variant='primary' size='medium' onClick={handleAddUser}>
						Добавить пользователя
					</Button>
				</div>
			</Card>

			<Card title='Бонусный компонент GenericList'>
				<GenericList
					items={users}
					renderItem={user => (
						<UserCard
							key={user.id}
							name={user.name}
							email={user.email}
							age={user.age}
							isOnline={user.isOnline}
						/>
					)}
				/>
			</Card>
		</div>
	)
}

export default App

// ===== БОНУСНЫЕ ЗАДАЧИ =====

// BONUS 1: Примените utility типы для типизации параметров компонента
// в компоненте Button

// BONUS 2: Создайте generic компонент List<T> с render prop паттерном
interface GenericListProps<T> {
	items: T[]
	renderItem: (item: T) => React.ReactNode
}

function GenericList<T>({ items, renderItem }: GenericListProps<T>) {
	return <div>{items.map(renderItem)}</div>
}

// BONUS 3: Добавьте поддержку ref forwarding в Button компонент
// в компоненте Button
