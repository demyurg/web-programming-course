import { 
  TrainingSet, 
  Answer, 
  findTaskById, 
  filterTasksByTopic, 
  calculateProgress 
} from './domain';

const sampleSet1: TrainingSet = {
  id: 'web-basics',
  title: 'Основы веб-программирования',
  tasks: [
    {
      id: 'ts-1',
      kind: 'single-choice',
      topic: 'typescript',
      prompt: 'Что выведет этот JavaScript-код?',
      code: 'console.log("10" * 5);',
      options: [
        { id: 'a', label: '105' },
        { id: 'b', label: '50' },
        { id: 'c', label: 'Ошибка' }
      ]
    },
    {
      id: 'react-1',
      kind: 'short-text',
      topic: 'react',
      prompt: 'Объясните, чем props компонента отличаются от его состояния.'
    }
  ]
};

const sampleSet2: TrainingSet = {
  id: 'set-empty-theme',
  title: 'Альтернативная пустая тема',
  tasks: []
};

Object.freeze(sampleSet1);
Object.freeze(sampleSet2);

const userAnswers: Answer[] = [
  { taskId: 'ts-1', kind: 'single-choice', optionId: 'b' },
  { taskId: 'react-1', kind: 'short-text', text: '    ' }, 
  { taskId: 'http-1', kind: 'short-text', text: 'Fetch check' } 
];

Object.freeze(userAnswers);

console.log('ДЕМО\n');

// Тестирование поиска по ID
console.log('Поиск по ID:');
const foundTask = findTaskById(sampleSet1.tasks, 'ts-1');
console.log('Поиск существующего ("ts-1"):', foundTask ? `Успешно ("${foundTask.prompt}")` : 'Не найдено');

const missingTask = findTaskById(sampleSet1.tasks, 'ts-777');
console.log('Поиск отсутствующего ("ts-777"):', missingTask);
console.log();

// Тестирование фильтрации по теме
console.log('Фильтрации по теме:');
console.log('Фильтр темы "typescript":', filterTasksByTopic(sampleSet1.tasks, 'typescript').length, 'задание(я)');
console.log('Фильтр темы "react":', filterTasksByTopic(sampleSet1.tasks, 'react').length, 'задание(я)');
console.log('Фильтр темы "vue" (нет совпадений):', filterTasksByTopic(sampleSet1.tasks, 'vue').length, 'заданий');
console.log();

// Расчет прогресса
console.log('Расчет прогресса:');
const mainProgress = calculateProgress(sampleSet1, userAnswers);
console.log(`Набор "web-basics": заполнено ${mainProgress.filled} из ${mainProgress.total} (по факту 1 из 2)`);

const emptyProgress = calculateProgress(sampleSet2, userAnswers);
console.log(`Пустой набор: заполнено ${emptyProgress.filled} из ${emptyProgress.total} (по факту 0 из 0)`);
console.log();

// Контроль чистоты функций
console.log('Проверка иммутабельности входов:');
console.log('Задачи в наборе не изменились:', sampleSet1.tasks.length === 2 ? 'Да' : 'Нет');
console.log('Массив ответов пользователя не изменился:', userAnswers.length === 3 ? 'Да' : 'Нет');
