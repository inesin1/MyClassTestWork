const knex = require('../connection')

/*
* Возвращает связку учеников и занятий по id занятия.
*
* @param {number} lessonId id занятия.
*
* @return {Object, undefined} Найденная связка или undefined, если не найдена.
* */
function getStudentsByLesson(lessonId) {
    return knex('lesson_students')
        .select('*')
        .where('lesson_id', lessonId);
}

module.exports = {
    getStudentsByLesson: getStudentsByLesson
}