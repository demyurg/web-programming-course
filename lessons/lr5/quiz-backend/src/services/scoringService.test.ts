import { scoringService } from "./scoringService.js" 
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('ScoringService', () => {
  describe('scoreMultipleSelect', () => {
    // Тест 1: Все ответы правильные
    it('должен вернуть максимальный балл когда все ответы правильные', () => {
      const correct = ['A', 'B', 'C'];
      const student = ['A', 'B', 'C'];
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(3);
    });

    // Тест 2: Смешанные ответы (правильные и неправильные)
    it('должен правильно считать комбинацию правильных и неправильных ответов', () => {
      const correct = ['A', 'B', 'C'];
      const student = ['A', 'B', 'D']; // A(+1), B(+1), D(-0.5) = 1.5
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(1.5);
    });

    // Тест 3: Только неправильные ответы (должен вернуть 0, не -1.5)
    it('должен вернуть 0 когда все ответы неправильные', () => {
      const correct = ['A', 'B'];
      const student = ['C', 'D', 'E']; // -0.5 * 3 = -1.5 -> min 0
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0);
    });

    // Тест 4: Пустой массив ответов студента
    it('должен вернуть 0 при пустом массиве ответов студента', () => {
      const correct = ['A', 'B', 'C'];
      const student: string[] = [];
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0);
    });

    // Тест 5: Пустой массив правильных ответов
    it('должен вернуть 0 при пустом массиве правильных ответов', () => {
      const correct: string[] = [];
      const student = ['A', 'B', 'C'];
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0);
    });

    // Тест 6: Один правильный, много неправильных (проверка min 0)
    it('должен вернуть 0 когда штрафы превышают бонусы', () => {
      const correct = ['A'];
      const student = ['A', 'B', 'C', 'D']; // +1, -0.5, -0.5, -0.5 = -0.5 -> 0
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0);
    });

    // Тест 7: Дублирующиеся ответы
    it('должен считать каждый ответ отдельно, включая дубликаты', () => {
      const correct = ['A', 'B'];
      const student = ['A', 'A', 'B']; // A(+1), A(+1), B(+1) = 3
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(3);
    });

    // Тест 8: Регистр букв (должен учитывать регистр, если не использовать toLowerCase)
    it('должен учитывать регистр букв при сравнении', () => {
      const correct = ['A', 'B', 'C'];
      const student = ['a', 'b', 'c']; // все неправильные, т.к. 'a' !== 'A'
      expect(scoringService.scoreMultipleSelect(correct, student)).toBe(0);
    });
  });

  describe('scoreEssay', () => {
    // Тест 1: Нормальные оценки в пределах рубрики
    it('должен правильно суммировать оценки в пределах рубрики', () => {
      const grades = [4, 2, 1];
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(7); // 4+2+1=7
    });

    // Тест 2: Оценки превышают максимум (должен ограничить)
    it('должен ограничить оценки максимальными значениями рубрики', () => {
      const grades = [6, 4, 3]; // все превышают максимум
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(10); // 5+3+2=10
    });

    // Тест 3: Частичное превышение
    it('должен ограничить только те оценки, которые превышают максимум', () => {
      const grades = [5, 4, 1]; // вторая оценка 4 > 3
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(9); // 5+3+1=9
    });

    // Тест 4: Разная длина массивов
    it('должен вернуть 0 при разной длине массивов', () => {
      const grades = [4, 2];
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(0);
    });

    // Тест 5: Пустые массивы
    it('должен вернуть 0 при пустых массивах', () => {
      expect(scoringService.scoreEssay([], [])).toBe(0);
    });

    // Тест 6: Нулевые оценки
    it('должен корректно работать с нулевыми оценками', () => {
      const grades = [0, 0, 0];
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(0);
    });

    // Тест 7: Дробные оценки
    it('должен корректно работать с дробными оценками', () => {
      const grades = [4.5, 2.5, 1.5];
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(8.5); // 4.5+2.5+1.5=8.5
    });

    // Тест 8: Дробные оценки с превышением
    it('должен ограничивать дробные оценки при превышении', () => {
      const grades = [5.5, 2.5, 1.5]; // первая оценка 5.5 > 5
      const rubric = [5, 3, 2];
      expect(scoringService.scoreEssay(grades, rubric)).toBe(9); // 5+2.5+1.5=9
    });

    // Тест 9: Отрицательные оценки (должен использовать Math.min)
    it('должен корректно обрабатывать отрицательные оценки', () => {
      const grades = [-1, 2, 1];
      const rubric = [5, 3, 2];
      // Math.min(-1, 5) = -1, поэтому -1 + 2 + 1 = 2
      expect(scoringService.scoreEssay(grades, rubric)).toBe(2);
    });
  });
});