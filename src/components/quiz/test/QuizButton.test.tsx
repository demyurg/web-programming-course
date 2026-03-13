import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QuizButton } from '../QuizButton';

describe('QuizButton', () => {
    it('рендерит кнопку с текстом', () => {
        render(<QuizButton onClick={() => { }}>Начать игру</QuizButton>);
        expect(screen.getByRole('button', { name: 'Начать игру' })).toBeInTheDocument();
    });

    it('вызывает onClick при клике', async () => {
        const handleClick = vi.fn();
        render(<QuizButton onClick={handleClick}>Кликни меня</QuizButton>);

        const user = userEvent.setup();
        await user.click(screen.getByRole('button'));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('отключается когда disabled = true', () => {
        render(
            <QuizButton onClick={() => { }} disabled>
                Отключено
            </QuizButton>
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });


    it('применяет secondary стили при variant="secondary"', () => {
        render(
            <QuizButton onClick={() => { }} variant="secondary">
                Secondary
            </QuizButton>
        );
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-gray-200 text-gray-800');
    });

});