import type { Answer, Task, TrainingSet } from "./domain"
import {findTask, filterByTopic, calcProgress} from "./domain"
 
const task1: Task = {
    id: "ts-1",
    kind: "single-choice",
    topic: "typescript",
    prompt: "Что выведет этот JavaScript-код?",
    code: "console.log(\"10\" * 5);",
    options: [
        {
            id:"a",
            label:"105"
        },
        {
            id:"b",
            label:"50"
        },
        {
            id:"c",
            label:"Ошибка"
        }
    ]
};

const task2: Task = {
    id: "react-1",
    kind: "short-text",
    topic: "react",
    prompt: "Объясните, чем props компонента отличаются от его состояния."
};

const task3: Task = {
    id: "html-1",
    kind: "short-text",
    topic: "html",
    prompt: "Какой тег используется для шапки"
}   

const task4: Task = {
    id: "html-2",
    kind: "short-text",
    topic: "html",
    prompt: "Какой тег используется для изображения"
}  

const set1: TrainingSet = {
    id: "web-basics",
    title: "Основы веб-программирования",
    tasks: [
        task1,
        task2
    ]
};

const set2: TrainingSet = {
    id: "html-basic",
    title: "Основы HTML",
    tasks: [
        task3,
        task4
    ]
}

const set3: TrainingSet = {
    id: "css-basic",
    title: "Основы CSS",
    tasks:[]
}

const answers1: Answer[] = [
    {
        taskId: "ts-1",
        kind: "single-choice",  
        optionId: "a"
    },
    {
        taskId: "react-1",
        kind: "short-text",
        text: "props передаются компоненту извне родительским элементом и доступны только для чтения"       
    }
]

const answers2: Answer[] = [
    {
        taskId: "html-1",
        kind: "short-text",
        text:"<header>"
    }
]

const answersBlank: Answer[] = [
    {
        taskId: "react-1",
        kind: "short-text",
        text: "   "
    }
];

//========Поиск задания по Id========
console.log("========Поиск задания по Id========")
console.log("ts-1", findTask(set1,"ts-1"))
console.log("ts-11111111", findTask(set1,"ts-11111111"))

//========Фильтрация заданий по произвольной строке========
console.log("========Фильтрация заданий по произвольной строке========")
console.log("typescript", filterByTopic(set1, "typescript"))
console.log("html", filterByTopic(set2, "html"))
console.log("python", filterByTopic(set1, "python"))
console.log("kotlin", filterByTopic(set3,"kotlin"))

//========Прогресс======== 
console.log("========Прогресс======== ")
console.log(calcProgress(set1,answers1))
console.log(calcProgress(set2,answers2))
console.log(calcProgress(set3,answers1))
console.log(calcProgress(set1,answers2))

//========Пробельный ответ======== 
console.log("Пробельный ответ:", calcProgress(set1, answersBlank));