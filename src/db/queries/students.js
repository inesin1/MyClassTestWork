const knex = require('../connection')

/*
* Возвращает ученика по id.
*
* @param {number} studentId id ученика.
*
* @return {Object, undefined} Найденный по id ученик или undefined, если не найден.
* */
async function getStudentById(studentId) {
    return knex('students')
        .select('*')
        .where('id', studentId)
        .first();
}

module.exports = {
    getStudentById: getStudentById
}