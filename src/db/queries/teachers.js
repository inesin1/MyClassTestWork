const knex = require('../connection')

/*
* Возвращает учителя по id.
*
* @param {number} teacherId id учителя.
*
* @return {Object, undefined} Найденный по id учитель или undefined, если не найден.
* */
async function getTeacherById(teacherId) {
    return knex('teachers')
        .select('*')
        .where('id', teacherId)
        .first();
}

module.exports = {
    getTeacherById: getTeacherById
}