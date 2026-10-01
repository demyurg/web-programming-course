type SingleChoiceTask = {
    id: string;
    kind: "single-choice";
    topic: string;
    prompt: string;
    options: { id: string; label: string }[];
    code?: string;
};

type ShortTextTask = {
    id: string;
    kind: "short-text";
    topic: string;
    prompt: string;
    code?: string;
};

type Task = SingleChoiceTask | ShortTextTask;

type TrainingSet = {
    id: string;
    title: string;
    tasks: Task[];
};

type SingleChoiceAnswer = {
    taskId: string;
    kind: "single-choice";
    optionId: string;   
};

type ShortTextAnswer = {
    taskId: string;
    kind: "short-text";
    text: string;
};

type Answer = SingleChoiceAnswer | ShortTextAnswer;

function findTask(set: TrainingSet, taskId: string): Task | undefined {
  return set.tasks.find((t) => t.id === taskId);
}

function filterTasksByTopic(set: TrainingSet, topic: string): Task[] {
  return set.tasks.filter((t) => t.topic === topic);
}

function countProgress(set: TrainingSet, answers: Answer[]): { filled: number; total: number } {
  const total = set.tasks.length;

  const filled = set.tasks.filter((task) => {
    const answer = answers.find((a) => a.taskId === task.id);
    return answer !== undefined && isAnswerFilled(answer);
  }).length;

  return { filled, total };
}

function isAnswerFilled(answer: Answer): boolean {
  if (answer.kind === "single-choice") {
    return answer.optionId.trim() !== "";
  }
  return answer.text.trim() !== "";
}

const ts1: Task = {
    id:"ts-1",
    kind:"single-choice",
    topic:"typescript",
    prompt:"Что выведет этот JavaScript-код?",
    code:"console.log(\"10\" * 5);",
    options: [
        { "id":"a", "label":"105"},
        { "id":"b", "label":"50"},
        { "id":"c", "label":"Ошибка"}]
};

const react1: Task = {
    id:"react-1", 
    kind:"short-text", 
    topic:"react", 
    prompt:"Объясните, чем props компонента отличаются от его состояния."};

const answers: Answer[] = [
    { taskId: "ts-1", kind: "single-choice", optionId: "b" },
    { taskId: "react-1", kind: "short-text", text: "Props приходят снаружи и неизменны, state — внутренний и меняется." },
];

const firstSet: TrainingSet = {
    id: "web-basics",
    title: "Основы веб-программирования",
    tasks: [ts1, react1],
};

const secondSet: TrainingSet = {
    id: "sql-basics",
    title: "Основы SQL",
    tasks: [
        {
            id: "sql-1",
            kind: "single-choice",
            topic: "sql",
            prompt: "Какой оператор выбирает данные из таблицы?",
            options: [
                { id: "a", label: "GET" },
                { id: "b", label: "SELECT" },
                { id: "c", label: "FETCH" },
            ],
        },
        {
            id: "sql-2",
            kind: "short-text",
            topic: "sql",
            prompt: "Что делает WHERE?",
        },
    ],
};

const emptySet: TrainingSet = {
    id: "empty",
    title: "Пустой набор",
    tasks: [],
};

console.log(findTask(firstSet, 'ts-1'));       
console.log(findTask(firstSet, 'no-such-id'));  
console.log(filterTasksByTopic(firstSet, 'typescript'));
console.log(filterTasksByTopic(firstSet, 'react'));      
console.log(filterTasksByTopic(firstSet, 'python'));     
console.log(filterTasksByTopic(emptySet, 'react'));      
console.log(countProgress(emptySet, []));              
console.log(countProgress(firstSet, [
  { taskId: 'ts-1', kind: 'single-choice', optionId: 'b' },
]));                                                      
console.log(countProgress(firstSet, [
  { taskId: 'ts-1', kind: 'single-choice', optionId: 'b' },
  { taskId: 'react-1', kind: 'short-text', text: 'Props снаружи, state внутри.' },
]));                                                    
console.log(countProgress(firstSet, [
  { taskId: 'unknown', kind: 'single-choice', optionId: 'a' },
]));                                                      
console.log(countProgress(firstSet, [
  { taskId: 'ts-1', kind: 'single-choice', optionId: 'b' },
  { taskId: 'react-1', kind: 'short-text', text: '    ' },
]));  
                              
const beforeSet = JSON.stringify(firstSet);
const beforeAnswers = JSON.stringify(answers);

findTask(firstSet, 'ts-1');
filterTasksByTopic(firstSet, 'typescript');
countProgress(firstSet, answers);

console.log('set unchanged     →', beforeSet === JSON.stringify(firstSet));
console.log('answers unchanged →', beforeAnswers === JSON.stringify(answers));

export {
  findTask,
  filterTasksByTopic,
  countProgress,
  firstSet,
  secondSet,
  emptySet,
  answers,
};