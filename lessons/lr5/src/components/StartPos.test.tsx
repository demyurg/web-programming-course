import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StartPos } from './StartPos';

const defaultProps = {
  theme: 'light' as const,
  soundEnabled: true,
  toggleTheme: vi.fn(),
  handleStartGame: vi.fn(),
  isPending: false,
};

describe('StartPos', () => {
  // Проверяет, что заголовок и подзаголовок отображаются на экране
  it('renders title and subtitle', () => {
    render(<StartPos {...defaultProps} />);
    expect(screen.getByText('Quiz Game')).toBeInTheDocument();
    expect(screen.getByText('MobX + Zustand Edition')).toBeInTheDocument();
  });

  // Проверяет, что кнопка «Начать игру» присутствует в DOM
  it('renders "Начать игру" button', () => {
    render(<StartPos {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Начать игру' })).toBeInTheDocument();
  });

  // Проверяет, что клик по кнопке «Начать игру» вызывает handleStartGame
  it('calls handleStartGame when start button is clicked', async () => {
    const handleStartGame = vi.fn();
    render(<StartPos {...defaultProps} handleStartGame={handleStartGame} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Начать игру' }));

    expect(handleStartGame).toHaveBeenCalledTimes(1);
  });
});
