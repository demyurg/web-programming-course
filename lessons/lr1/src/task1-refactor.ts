type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

interface User {
	name: string
	age: number
	email: string
	isAdmin: boolean
	createdAt: Date
	getId: () => string
}

interface ProcessedUser extends User {
	displayName: string
	isAdult: boolean
}

function calculate(operation: Operation, a: number, b: number): number | null {
	switch (operation) {
		case 'add':
			return a + b
		case 'subtract':
			return a - b
		case 'multiply':
			return a * b
		case 'divide':
			if (b === 0) {
				return null
			}
			return a / b
		default:
			return null
	}
}

function createUser(
	name: string,
	age: number,
	email: string,
	isAdmin?: boolean,
): User {
	return {
		name,
		age,
		email,
		isAdmin: isAdmin || false,
		createdAt: new Date(),
		getId: function (): string {
			return Math.random().toString(36).slice(2, 11)
		},
	}
}

function processUsers(users: User[]): ProcessedUser[] {
	return users.map(user => {
		return {
			...user,
			displayName: user.name.toUpperCase(),
			isAdult: user.age >= 18,
		}
	})
}

function findUser(
	users: User[],
	criteria: string | number | Partial<User>,
): User | null {
	if (typeof criteria === 'string') {
		return users.find(user => user.name === criteria) ?? null
	}
	if (typeof criteria === 'number') {
		return users.find(user => user.age === criteria) ?? null
	}
	if (typeof criteria === 'object' && criteria !== null) {
		return (
			users.find(user => {
				return (Object.keys(criteria) as Array<keyof User>).every(
					key => user[key] === criteria[key],
				)
			}) ?? null
		)
	}
	return null
}

console.log(calculate('add', 10, 5))
console.log(calculate('divide', 10, 0))

const user: User = createUser('Анна', 25, 'anna@example.com')
console.log(user)

const users: User[] = [
	createUser('Петр', 30, 'peter@example.com', true),
	createUser('Мария', 16, 'maria@example.com'),
]

const processedUsers: ProcessedUser[] = processUsers(users)
console.log(processedUsers)

const foundUser: User | null = findUser(users, 'Петр')
console.log(foundUser)

const foundByAge: User | null = findUser(users, 30)
console.log(foundByAge)

const foundByObject: User | null = findUser(users, { name: 'Мария', age: 16 })
console.log(foundByObject)
