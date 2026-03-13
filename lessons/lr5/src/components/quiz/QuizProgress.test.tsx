import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuizProgress } from './QuizProgress';

describe('QuizProgress', () => {
  it('shows current question and total', () => {
    render(<QuizProgress current={0} total={4} />);

    expect(screen.getByText(/Вопрос 1 из 4/)).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('handles zero total questions', () => {
    render(<QuizProgress current={0} total={0} />);

    expect(screen.getByText(/Вопрос 1 из 0/)).toBeInTheDocument();
    expect(screen.getByText(/0%/)).toBeInTheDocument();
  });
});

