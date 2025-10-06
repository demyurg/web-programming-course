/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import { useState, useEffect, useCallback, useReducer, useRef } from 'react'

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

interface CounterState {
	count: number
	step: number
	isRunning: boolean
	history: number[]
}

const initialCounterState: CounterState = {
	count: 0,
	step: 1,
	isRunning: false,
	history: [],
}

function Counter(): JSX.Element {
	const [state, setState] = useState<CounterState>(initialCounterState)

	const increment = useCallback(() => {
		setState(s => ({
			...s,
			count: s.count + s.step,
			history: [...s.history, s.count + s.step],
		}))
	}, [])

	const decrement = () => {
		setState(s => ({
			...s,
			count: s.count - s.step,
			history: [...s.history, s.count - s.step],
		}))
	}

	const setStep = (newStep: number) => {
		setState(s => ({ ...s, step: newStep }))
	}

	const toggleRunning = () => {
		setState(s => ({ ...s, isRunning: !s.isRunning }))
	}

	const reset = () => {
		setState(initialCounterState)
	}

	useEffect(() => {
		if (state.isRunning) {
			const interval = setInterval(increment, 1000)
			return () => clearInterval(interval)
		}
	}, [state.isRunning, increment])

	return (
		<div className='counter'>
			<h2>Счетчик: {state.count}</h2>
			<p>Шаг: {state.step}</p>

			<div className='controls'>
				<button onClick={increment}>+</button>
				<button onClick={decrement}>-</button>
				<button onClick={toggleRunning}>
					{state.isRunning ? 'Стоп' : 'Старт'}
				</button>
				<button onClick={reset}>Сброс</button>
			</div>

			<div className='step-control'>
				<label>
					Шаг:
					<input
						type='number'
						value={state.step}
						onChange={e => setStep(Number(e.target.value))}
						min='1'
					/>
				</label>
			</div>

			<div className='history'>
				<h3>История:</h3>
				<ul>
					{state.history.map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</div>
		</div>
	)
}

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

interface Todo {
	id: string
	text: string
	completed: boolean
}

function TodoApp(): JSX.Element {
	const [todos, setTodos] = useState<Todo[]>([])
	const [newTodoText, setNewTodoText] = useState<string>('')

	const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (newTodoText.trim()) {
			const newTodo: Todo = {
				id: Date.now().toString(),
				text: newTodoText,
				completed: false,
			}
			setTodos(prev => [...prev, newTodo])
			setNewTodoText('')
		}
	}

	const toggleTodo = (id: string) => {
		setTodos(prev =>
			prev.map(todo =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		)
	}

	const deleteTodo = (id: string) => {
		setTodos(prev => prev.filter(todo => todo.id !== id))
	}

	const completedCount = todos.filter(todo => todo.completed).length

	return (
		<div className='todo-app'>
			<h2>Todo приложение</h2>

			<form onSubmit={addTodo}>
				<input
					type='text'
					value={newTodoText}
					onChange={e => setNewTodoText(e.target.value)}
					placeholder='Добавить новую задачу...'
				/>
				<button type='submit'>Добавить</button>
			</form>

			<ul className='todo-list'>
				{todos.map(todo => (
					<li key={todo.id} className={todo.completed ? 'completed' : ''}>
						<input
							type='checkbox'
							checked={todo.completed}
							onChange={() => toggleTodo(todo.id)}
						/>
						<span>{todo.text}</span>
						<button onClick={() => deleteTodo(todo.id)}>Удалить</button>
					</li>
				))}
			</ul>

			<div className='stats'>
				<p>Всего: {todos.length}</p>
				<p>Завершено: {completedCount}</p>
			</div>
		</div>
	)
}

// ===== ЗАДАЧА 2.3: Кастомные хуки =====

function useToggle(initialValue: boolean = false): [boolean, () => void] {
	const [value, setValue] = useState(initialValue)
	const toggle = useCallback(() => setValue(v => !v), [])
	return [value, toggle]
}

function useCounter(initialValue: number = 0) {
	const [count, setCount] = useState(initialValue)
	const increment = useCallback(() => setCount(c => c + 1), [])
	const decrement = useCallback(() => setCount(c => c - 1), [])
	const reset = useCallback(() => setCount(initialValue), [initialValue])
	return { count, increment, decrement, reset }
}

// БОНУС 1: useLocalStorage
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

// БОНУС 2: usePrevious
function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	}, [value])
	return ref.current
}

// БОНУС 3: TodoApp с useReducer
type TodoAction =
	| { type: 'ADD_TODO'; payload: string }
	| { type: 'TOGGLE_TODO'; payload: string }
	| { type: 'DELETE_TODO'; payload: string }
	| { type: 'SET_NEW_TODO_TEXT'; payload: string }

interface TodoState {
	todos: Todo[]
	newTodoText: string
}

const initialTodoState: TodoState = {
	todos: [],
	newTodoText: '',
}

function todoReducer(state: TodoState, action: TodoAction): TodoState {
	switch (action.type) {
		case 'ADD_TODO': {
			if (!action.payload.trim()) return state
			const newTodo: Todo = {
				id: Date.now().toString(),
				text: action.payload,
				completed: false,
			}
			return {
				...state,
				todos: [...state.todos, newTodo],
				newTodoText: '',
			}
		}
		case 'TOGGLE_TODO':
			return {
				...state,
				todos: state.todos.map(todo =>
					todo.id === action.payload
						? { ...todo, completed: !todo.completed }
						: todo,
				),
			}
		case 'DELETE_TODO':
			return {
				...state,
				todos: state.todos.filter(todo => todo.id !== action.payload),
			}
		case 'SET_NEW_TODO_TEXT':
			return {
				...state,
				newTodoText: action.payload,
			}
		default:
			return state
	}
}

function TodoAppWithReducer(): JSX.Element {
	const [state, dispatch] = useReducer(todoReducer, initialTodoState)

	const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		dispatch({ type: 'ADD_TODO', payload: state.newTodoText })
	}

	const toggleTodo = (id: string) => {
		dispatch({ type: 'TOGGLE_TODO', payload: id })
	}

	const deleteTodo = (id: string) => {
		dispatch({ type: 'DELETE_TODO', payload: id })
	}

	const setNewTodoText = (text: string) => {
		dispatch({ type: 'SET_NEW_TODO_TEXT', payload: text })
	}

	const completedCount = state.todos.filter(todo => todo.completed).length

	return (
		<div className='todo-app'>
			<h2>Todo приложение (с useReducer)</h2>

			<form onSubmit={addTodo}>
				<input
					type='text'
					value={state.newTodoText}
					onChange={e => setNewTodoText(e.target.value)}
					placeholder='Добавить новую задачу...'
				/>
				<button type='submit'>Добавить</button>
			</form>

			<ul className='todo-list'>
				{state.todos.map(todo => (
					<li key={todo.id} className={todo.completed ? 'completed' : ''}>
						<input
							type='checkbox'
							checked={todo.completed}
							onChange={() => toggleTodo(todo.id)}
						/>
						<span>{todo.text}</span>
						<button onClick={() => deleteTodo(todo.id)}>Удалить</button>
					</li>
				))}
			</ul>

			<div className='stats'>
				<p>Всего: {state.todos.length}</p>
				<p>Завершено: {completedCount}</p>
			</div>
		</div>
	)
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

function HooksDemo(): JSX.Element {
	const { count, increment, decrement, reset } = useCounter(0)
	const [isToggled, toggle] = useToggle(false)

	return (
		<div className='hooks-demo'>
			<h2>Демо кастомных хуков</h2>

			<div className='demo-section'>
				<h3>useCounter</h3>
				<p>Счетчик: {count}</p>
				<button onClick={increment}>+</button>
				<button onClick={decrement}>-</button>
				<button onClick={reset}>Сброс</button>
			</div>

			<div className='demo-section'>
				<h3>useToggle</h3>
				<p>Состояние: {isToggled ? 'Включено' : 'Выключено'}</p>
				<button onClick={toggle}>Переключить</button>
			</div>
		</div>
	)
}

// ===== Демо для бонусных хуков =====

function LocalStorageDemo(): JSX.Element {
	const [name, setName] = useLocalStorage('name', 'Гость')

	return (
		<div className='hooks-demo'>
			<h2>Демо useLocalStorage</h2>
			<p>Привет, {name}</p>
			<input
				type='text'
				value={name}
				onChange={e => setName(e.target.value)}
				placeholder='Введите ваше имя'
			/>
		</div>
	)
}

function PreviousValueDemo(): JSX.Element {
	const [count, setCount] = useState(0)
	const prevCount = usePrevious(count)

	return (
		<div className='hooks-demo'>
			<h2>Демо usePrevious</h2>
			<p>Текущее значение: {count}</p>
			<p>Предыдущее значение: {prevCount ?? 'нет'}</p>
			<button onClick={() => setCount(c => c + 1)}>Увеличить</button>
		</div>
	)
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
const TABS = {
	counter: {
		text: 'Счетчик',
		component: () => <Counter />,
	},
	todos: {
		text: 'Todo',
		component: () => <TodoApp />,
	},
	hooks: {
		text: 'Хуки',
		component: () => <HooksDemo />,
	},
	todoReducer: {
		text: 'Todo (Reducer)',
		component: () => <TodoAppWithReducer />,
	},
	localStorage: {
		text: 'useLocalStorage',
		component: () => <LocalStorageDemo />,
	},
	previous: {
		text: 'usePrevious',
		component: () => <PreviousValueDemo />,
	},
}

type TabKey = keyof typeof TABS

function App(): JSX.Element {
	const [activeTab, setActiveTab] = useState<TabKey>('counter')

	return (
		<div className='app'>
			<nav className='tabs'>
				{Object.entries(TABS).map(([key, tab]) => (
					<button
						key={key}
						className={activeTab === key ? 'active' : ''}
						onClick={() => setActiveTab(key as TabKey)}
					>
						{tab.text}
					</button>
				))}
			</nav>

			<div className='tab-content'>{TABS[activeTab].component()}</div>
		</div>
	)
}

export default App
