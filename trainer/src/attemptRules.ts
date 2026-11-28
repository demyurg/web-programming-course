import { type Answer, updateAnswer } from './domain.js';
import { type Attempt } from './api/trainerApi.js'; 

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
  | { type: 'SET_VIEW_MODE'; mode: 'task' | 'review' }
  | { type: 'SYNC_FROM_SERVER'; attempt: Attempt }; 

export function attemptReducer(state: AttemptState, action: AttemptAction): AttemptState {
  if (
    state.status === 'submitted' &&
    action.type !== 'SELECT_TASK' &&
    action.type !== 'SET_VIEW_MODE' &&
    action.type !== 'SYNC_FROM_SERVER'
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
    case 'SYNC_FROM_SERVER': 
      return {
        ...state,
        answers: action.attempt.answers as Answer[],
        status: action.attempt.status === 'submitted' ? 'submitted' : 'draft',
        viewMode: action.attempt.status === 'submitted' ? 'review' : 'task',
        selectedTaskId:
          state.selectedTaskId ??
          action.attempt.trainingSet.tasks[0]?.id,
      };
    default:
      return state;
  }
}

export function canEdit(state: AttemptState): boolean {
  return state.status === 'draft';
}