import { observer } from 'mobx-react-lite';
import { gameStore } from '../stores/gameStore';
import { useUIStore } from '../stores/uiStore';
import { usePostApiSessions } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdAnswers } from '../../generated/api/sessions/sessions';
import { usePostApiSessionsSessionIdSubmit } from '../../generated/api/sessions/sessions';
import * as React from 'react'
import { SubmitAnswerRequest } from '../../generated/api/quizBattleAPI.schemas';
