import { makeAutoObservable } from 'mobx'
import { Question, AnswerWithTime, GameStats } from '../types/quiz'
import { mockQuestions } from '../data/questions'

class GameStore {
  gameStatus: 'idle' | 'playing' | 'finished' = 'idle'

  questions: Question[] = []
  currentQuestionIndex = 0
  score = 0
  selectedAnswer: number | null = null
  answeredQuestions: AnswerWithTime[] = []

  timeElapsed = 0
  questionStartTime = 0
  private timerInterval: number | null = null

  stats: GameStats = {
    totalGamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    averageTimePerQuestion: 0,
    lastPlayedDate: '',
  }

  constructor() {
    makeAutoObservable(this)
    this.loadStats()
  }

  startGame() {
    this.gameStatus = 'playing'
    this.questions = mockQuestions
    this.currentQuestionIndex = 0
    this.score = 0
    this.selectedAnswer = null
    this.answeredQuestions = []
    this.timeElapsed = 0
    this.questionStartTime = Date.now()
    this.startTimer()
  }

  selectAnswer(answerIndex: number) {
    console.log('Selected answer:', answerIndex)
    if (this.selectedAnswer !== null) return

    this.selectedAnswer = answerIndex

    const currentQuestion = this.currentQuestion
    if (!currentQuestion) return

    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      this.score += 1
    }

    const timeSpent = this.questionStartTime
      ? Math.floor((Date.now() - this.questionStartTime) / 1000)
      : 0

    this.answeredQuestions.push({
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent,
    })
  }

  nextQuestion() {
    if (this.isLastQuestion) {
      this.finishGame()
    } else {
      this.currentQuestionIndex += 1
      this.selectedAnswer = null
      this.questionStartTime = Date.now()
    }
  }

  finishGame() {
    this.gameStatus = 'finished'
    this.stopTimer()
    this.updateStats()
  }

  resetGame() {
    this.gameStatus = 'idle'
    this.questions = []
    this.currentQuestionIndex = 0
    this.score = 0
    this.selectedAnswer = null
    this.answeredQuestions = []
    this.timeElapsed = 0
    this.questionStartTime = 0
    this.stopTimer()
  }

  private startTimer() {
    this.stopTimer()
    this.timerInterval = window.setInterval(() => {
      this.timeElapsed += 1
    }, 1000)
  }

  private stopTimer() {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  private loadStats() {
    const saved = localStorage.getItem('game-stats')
    if (saved) {
      try {
        this.stats = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load stats:', e)
      }
    }
  }

  private updateStats() {
    const correctAnswers = this.correctAnswersCount
    const totalQuestions = this.questions.length

    this.stats.totalGamesPlayed += 1
    this.stats.totalCorrectAnswers += correctAnswers
    this.stats.totalQuestions += totalQuestions

    if (this.score > this.stats.bestScore) {
      this.stats.bestScore = this.score
    }

    const totalScore =
      this.stats.averageScore * (this.stats.totalGamesPlayed - 1) + this.score
    this.stats.averageScore = Math.round(
      totalScore / this.stats.totalGamesPlayed,
    )

    const totalTime = this.answeredQuestions.reduce(
      (sum, answer) => sum + answer.timeSpent,
      0,
    )
    const avgTimeThisGame = totalQuestions > 0 ? totalTime / totalQuestions : 0

    const prevAvgTime =
      this.stats.averageTimePerQuestion * (this.stats.totalGamesPlayed - 1)
    this.stats.averageTimePerQuestion = Math.round(
      (prevAvgTime + avgTimeThisGame) / this.stats.totalGamesPlayed,
    )

    this.stats.lastPlayedDate = new Date().toISOString()
    this.saveStats()
  }

  resetStats() {
    this.stats = {
      totalGamesPlayed: 0,
      bestScore: 0,
      averageScore: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      averageTimePerQuestion: 0,
      lastPlayedDate: '',
    }
    localStorage.removeItem('game-stats')
  }

  private saveStats() {
    localStorage.setItem('game-stats', JSON.stringify(this.stats))
  }

  get currentQuestion(): Question | null {
    if (this.questions.length === 0) return null
    return this.questions[this.currentQuestionIndex] || null
  }

  get progress(): number {
    if (this.questions.length === 0) return 0
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1
  }

  get correctAnswersCount(): number {
    return this.answeredQuestions.filter(answer => answer.isCorrect).length
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeElapsed / 60)
    const seconds = this.timeElapsed % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  get averageTimePerAnswer(): number {
    if (this.answeredQuestions.length === 0) return 0
    const total = this.answeredQuestions.reduce(
      (sum, answer) => sum + answer.timeSpent,
      0,
    )
    return Math.round(total / this.answeredQuestions.length)
  }

  get accuracyPercentage(): number {
    if (this.stats.totalQuestions === 0) return 0
    return Math.round(
      (this.stats.totalCorrectAnswers / this.stats.totalQuestions) * 100,
    )
  }
}

export const gameStore = new GameStore()
