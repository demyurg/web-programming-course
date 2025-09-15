'use client'

import dynamic from 'next/dynamic'

import styles from './Header.module.scss'

const MenuIcon = dynamic(() => import('lucide-react').then(mod => mod.Menu), {
	ssr: false,
})

export default function Header() {
	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<h1 className={styles.title}>Анна Светлова</h1>

				<input
					id='nav-toggle'
					type='checkbox'
					className={styles.navToggle}
					aria-hidden='true'
				/>
				<label
					htmlFor='nav-toggle'
					className={styles.burger}
					aria-label='Открыть меню'
				>
					<MenuIcon
						size={32}
						strokeWidth={2}
						aria-hidden='true'
						className={styles.burgerIcon}
					/>
				</label>

				<nav className={styles.nav} role='navigation'>
					<a>Главная</a>
					<a>Обо мне</a>
					<a>Галерея</a>
					<a>Контакты</a>
				</nav>
			</div>
		</header>
	)
}
