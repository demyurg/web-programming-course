import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MultipleSelectQuestion } from '../MultipleSelectQuestion';

describe('MultipleSelectQuestion', () => {
    const mockQuestion = {
        id: 'q1',
        type: 'multiple-select' as const,
        question: 'Какие хуки есть в React?',
        options: ['useState', 'useEffect', 'useClass', 'useMemo'],
        correctAnswers: [0, 1, 3],
        difficulty: 'easy' as const
    };

    it('рендерит все варианты ответов', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        expect(screen.getByText('useState')).toBeInTheDocument();
        expect(screen.getByText('useEffect')).toBeInTheDocument();
        expect(screen.getByText('useClass')).toBeInTheDocument();
        expect(screen.getByText('useMemo')).toBeInTheDocument();
    });

    it('отображает буквенные метки для невыбранных опций', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('A');
        expect(buttons[1]).toHaveTextContent('B');
        expect(buttons[2]).toHaveTextContent('C');
        expect(buttons[3]).toHaveTextContent('D');
    });

    it('отображает галочки для выбранных опций', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0, 2]}
                onToggleAnswer={() => { }}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('✓');
        expect(buttons[1]).toHaveTextContent('B');
        expect(buttons[2]).toHaveTextContent('✓');
        expect(buttons[3]).toHaveTextContent('D');
    });

    it('вызывает onToggleAnswer с правильным индексом при клике', async () => {
        const handleToggle = vi.fn();
        const user = userEvent.setup();

        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={handleToggle}
            />
        );

        const useStateButton = screen.getByText('useState');
        await user.click(useStateButton);

        expect(handleToggle).toHaveBeenCalledWith(0);
    });


    it('показывает сообщение если options отсутствуют', () => {
        const questionWithoutOptions = {
            ...mockQuestion,
            options: undefined as any
        };

        render(
            <MultipleSelectQuestion
                question={questionWithoutOptions}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        expect(screen.getByText('Нет доступных вариантов ответа')).toBeInTheDocument();
    });

    it('показывает сообщение если массив options пустой', () => {
        const questionWithEmptyOptions = {
            ...mockQuestion,
            options: []
        };

        render(
            <MultipleSelectQuestion
                question={questionWithEmptyOptions}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        expect(screen.getByText('Нет доступных вариантов ответа')).toBeInTheDocument();
    });

    it('применяет светлую тему по умолчанию', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        const button = screen.getAllByRole('button')[0];
        expect(button.className).toContain('border-gray-200');
        expect(button.className).toContain('bg-white');
    });

    it('применяет темную тему когда theme="dark"', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
                theme="dark"
            />
        );

        const button = screen.getAllByRole('button')[0];
        expect(button.className).toContain('border-gray-600');
        expect(button.className).toContain('bg-gray-700');
    });
});