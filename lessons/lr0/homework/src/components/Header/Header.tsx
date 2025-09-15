'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'

import useClickOutside from '@/hooks/useClickOutside'

import styles from './Header.module.scss'

const MenuIcon = dynamic(() => import('lucide-react').then(mod => mod.Menu), {
	ssr: false,
})

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false)
	const navRef = useRef<HTMLElement>(null)
	const burgerRef = useRef<HTMLButtonElement>(null)

	useClickOutside(navRef as React.RefObject<HTMLElement>, e => {
		if (burgerRef.current && burgerRef.current.contains(e.target as Node))
			return
		setMenuOpen(false)
	})

	const handleNavLinkClick = () => {
		setMenuOpen(false)
	}

	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<h1 className={styles.title}>Анна Светлова</h1>

				<button
					ref={burgerRef}
					className={styles.burger}
					aria-label='Открыть меню'
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen(open => !open)}
				>
					<MenuIcon
						size={32}
						strokeWidth={2}
						aria-hidden='true'
						className={styles.burgerIcon}
					/>
				</button>

				<nav
					ref={navRef}
					className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
					role='navigation'
				>
					<a href='#home' aria-label='Главная' onClick={handleNavLinkClick}>
						Главная
					</a>
					<a href='#about' aria-label='Обо мне' onClick={handleNavLinkClick}>
						Обо мне
					</a>
					<a href='#gallery' aria-label='Галерея' onClick={handleNavLinkClick}>
						Галерея
					</a>
					<a
						href='#contacts'
						aria-label='Контакты'
						onClick={handleNavLinkClick}
					>
						Контакты
					</a>
				</nav>
			</div>
		</header>
	)
}
