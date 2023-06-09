// 2. Напишіть функцію, яка приймає будь-який тип масиву та правило для видалення елементів масиву. 
// Функція змінює переданий масив, а усі видалені елементи функція повертає окремим масивом такого ж типу. 
// Усі типи мають застосовуватися автоматично (функція шаблону).
// IDE має розглядати змінні з прикладу так:
// item: number
// deletedElements: Array
// результат виклику:
// array = [1, 3, 7, 9]
// deletedElements = [2, 6]

function arrayChangeDelete<T>(arr: Array<T>, cond: (item: T) => boolean): Array<T> {
    let result: typeof arr = [];
    arr.forEach((item, index) => {
        if (cond(item)) {
            let del = arr.splice(index, 1);
            result.push(...del);
        }
    });
    return result;
}

const array = [1, 2, 3, 6, 7, 9];
const deletedElements = arrayChangeDelete(array, (item) => item % 2 === 0);
console.log(array);
console.log(deletedElements);