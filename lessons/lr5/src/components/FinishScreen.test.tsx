import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinishScreen } from './FinishScreen';

const defaultProps = {
  theme: 'light' as const,
  score: 42,
  correctAnswersCount: 3,
  totalQuestions: 5,
  onPlayAgain: vi.fn(),
};

describe('FinishScreen', () => {
  // Проверяем, что заголовок «Игра завершена!» отображается
  it('показывает заголовок', () => {
    render(<FinishScreen {...defaultProps} />);
    expect(screen.getByText('Игра завершена!')).toBeInTheDocument();
  });

  // Проверяем эмодзи: 80%+ = кубок, 60%+ = улыбка, 40%+ = задумчивый, иначе = грустный
  it('показывает кубок при 80% и выше', () => {
    render(<FinishScreen {...defaultProps} correctAnswersCount={4} totalQuestions={5} />);
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  it('показывает улыбку при 60-79%', () => {
    render(<FinishScreen {...defaultProps} correctAnswersCount={3} totalQuestions={5} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('показывает грустный эмодзи при менее 40%', () => {
    render(<FinishScreen {...defaultProps} correctAnswersCount={2} totalQuestions={5} />);
    expect(screen.getByText('🤔')).toBeInTheDocument();
  });

  it('показывает грустный эмодзи при менее 40%', () => {
    render(<FinishScreen {...defaultProps} correctAnswersCount={1} totalQuestions={5} />);
    expect(screen.getByText('😢')).toBeInTheDocument();
  });
  
  it('правильно считает процент', () => {
    render(<FinishScreen {...defaultProps} correctAnswersCount={3} totalQuestions={5} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
