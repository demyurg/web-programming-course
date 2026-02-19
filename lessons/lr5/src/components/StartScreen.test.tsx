import { render, screen, fireEvent } from '@testing-library/react';
// import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { StartScreen } from './StartScreen';

const defaultProps = {
  theme: 'light' as const,
  soundEnabled: true,
  toggleTheme: vi.fn(),
  handleStartGame: vi.fn(),
  isPending: false,
};

describe('StartScreen', () => {
  // проверка заголовка и подзаголовка
  it('renders title and subtitle', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByText('Quiz Game')).toBeInTheDocument();
    expect(screen.getByText('MobX + Zustand Edition')).toBeInTheDocument();
  });

  // Проверка присутствия кнопки «Начать игру» в DOM
  it('renders "Начать игру" button', () => {
    render(<StartScreen {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Начать игру' })).toBeInTheDocument();
  });

  // Проверка, что клик по кнопке «Начать игру» вызывает handleStartGame
  it('calls handleStartGame when start button is clicked', async () => {
    const handleStartGame = vi.fn();
    render(<StartScreen {...defaultProps} handleStartGame={handleStartGame} />);


    const button = screen.getByRole('button', { name: 'Начать игру' });
    fireEvent.click(button)
    // const user = userEvent.setup();
    // await user.click();

    expect(handleStartGame).toHaveBeenCalledTimes(1);
  });
});
