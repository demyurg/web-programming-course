import { type Answer, updateAnswer } from './domain.js';

export type AttemptStatus = 'draft' | 'submitted';

export type AttemptState = {
  status: AttemptStatus;
  answers: Answer[];
  selectedTaskId: string | undefined;
  viewMode: 'task' | 'review';
};

export type AttemptAction =
  | { type: 'SET_ANSWER'; answer: Answer }
  | { type: 'CLEAR_ANSWER'; taskId: string }
  | { type: 'SUBMIT' }
  | { type: 'SELECT_TASK'; taskId: string }
  | { type: 'SET_VIEW_MODE'; mode: 'task' | 'review' };

export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  if (
    state.status === 'submitted' &&
    action.type !== 'SELECT_TASK' &&
    action.type !== 'SET_VIEW_MODE'
  ) {
    return state;
  }

  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: updateAnswer(state.answers, action.answer),
      };
    case 'CLEAR_ANSWER':
      return {
        ...state,
        answers: state.answers.filter((a) => a.taskId !== action.taskId),
      };
    case 'SUBMIT':
      return { ...state, status: 'submitted', viewMode: 'review' };
    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.taskId, viewMode: 'task' };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    default:
      return state;
  }
}

export function canEdit(state: AttemptState): boolean {
  return state.status === 'draft';
}