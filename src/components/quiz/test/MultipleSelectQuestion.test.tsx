import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MultipleSelectQuestion } from '../MultipleSelectQuestion';
const mockQuestion = {
    id: 'q1',
    type: 'multiple-select' as const,
    question: 'Какие хуки есть в React?',
    options: ['useState', 'useEffect', 'useClass', 'useMemo'],
    correctAnswers: [0, 1, 3],
    difficulty: 'easy' as const
};

describe('MultipleSelectQuestion', () => {
    it('renders all options', () => {
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

    it('displays letter labels for unselected options', () => {
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

    it('displays checkmarks for selected options', () => {
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

    it('calls onToggleAnswer with correct index when clicked', async () => {
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


    it('renders nothing when options are undefined', () => {
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
    it('toggles selection off on second click', async () => {
        const handleToggle = vi.fn();
        const user = userEvent.setup();

        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0]} 
                onToggleAnswer={handleToggle}
            />
        );

        await user.click(screen.getByText('useState'));

        expect(handleToggle).toHaveBeenCalledWith(0);
        expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('tracks total number of selections', async () => {
        const handleToggle = vi.fn();
        const user = userEvent.setup();

        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={handleToggle}
            />
        );

        await user.click(screen.getByText('useState'));
        await user.click(screen.getByText('useEffect'));
        await user.click(screen.getByText('useMemo'));
        expect(handleToggle).toHaveBeenCalledTimes(3);
        });
    });

describe('Visual State Updates', () => {
    it('shows letters for all options initially', () => {
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

    it('shows checkmark when option becomes selected', async () => {
        const user = userEvent.setup();
        let currentAnswers: number[] = [];

        const handleToggle = (index: number) => {
            currentAnswers = currentAnswers.includes(index)
                ? currentAnswers.filter(i => i !== index)
                : [...currentAnswers, index];
        };

        const { rerender } = render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={currentAnswers}
                onToggleAnswer={handleToggle}
            />
        );

        const button = screen.getByText('useState');
        await user.click(button);

        // Ререндерим с обновленным состоянием
        rerender(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0]}
                onToggleAnswer={handleToggle}
            />
        );

        expect(button).toHaveTextContent('✓');
    });

    it('shows letter when option becomes deselected', async () => {
        const user = userEvent.setup();

        const { rerender } = render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0]}
                onToggleAnswer={() => { }}
            />
        );

        const button = screen.getByText('useState');
        expect(button).toHaveTextContent('✓');

        // Ререндерим с пустым массивом (имитируем отмену выбора)
        rerender(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[]}
                onToggleAnswer={() => { }}
            />
        );

        expect(button).toHaveTextContent('A');
    });

    it('shows multiple checkmarks when multiple options selected', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0, 1]}
                onToggleAnswer={() => { }}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('✓');
        expect(buttons[1]).toHaveTextContent('✓');
        expect(buttons[2]).toHaveTextContent('C');
        expect(buttons[3]).toHaveTextContent('D');
    });

    it('preserves other checkmarks when deselecting one option', () => {
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0, 1, 3]} // useState, useEffect, useMemo выбраны
                onToggleAnswer={() => { }}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('✓'); // useState
        expect(buttons[1]).toHaveTextContent('✓'); // useEffect
        expect(buttons[2]).toHaveTextContent('C'); // useClass
        expect(buttons[3]).toHaveTextContent('✓'); // useMemo

        // Ререндерим без useEffect
        render(
            <MultipleSelectQuestion
                question={mockQuestion}
                selectedAnswers={[0, 3]} // только useState и useMemo
                onToggleAnswer={() => { }}
            />
        );

        expect(buttons[0]).toHaveTextContent('✓'); // useState
        expect(buttons[1]).toHaveTextContent('B'); // useEffect (стал буквой)
        expect(buttons[2]).toHaveTextContent('C'); // useClass
        expect(buttons[3]).toHaveTextContent('✓'); // useMemo
    });
});

