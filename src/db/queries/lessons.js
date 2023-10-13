const knex = require('../connection')

/*
* Возвращает все уроки из базы данных.
*
* @param {number} page Страница (Если не указано - возврат всех уроков).
* @param {number} lessonsPerPage Количество уроков на странице (По умолчанию - 5).
*
* @return {Array<Object>} Массив уроков из базы данных.
* */
function getLessons(page = 0, lessonsPerPage = 5) {
    if (page !== 0) {
        return knex('lessons')
            .select('*')
            .offset((page - 1) * lessonsPerPage)
            .limit(lessonsPerPage);
    }
    else {
        return knex('lessons')
            .select('*')
    }
}

/*
* Создает одно или несколько занятий в базе данных.
*
* @param {Object, Array<Object>} lessons Занятие или массив занятий.
*
* @return {Array<number>} Массив с id созданных занятий
* */
function createLessons(lessons) {
    return knex('lessons')
        .insert(lessons, ['id'])
}

module.exports = {
    getLessons: getLessons,
    createLessons: createLessons
}