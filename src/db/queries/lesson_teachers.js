const knex = require('../connection')

/*
* Возвращает связку учителей и занятий по id занятия.
*
* @param {number} lessonId id занятия.
*
* @return {Object, undefined} Найденная связка или undefined, если не найдена.
* */
function getLessonTeachersByLessonId(lessonId) {
    return knex('lesson_teachers')
        .select('*')
        .where('lesson_id', lessonId);
}

/*
* Создает связку учителя и занятия.
*
* @param {Object, Array<Object>} lessonTeachers Связка или массив связок учителей и занятий.
*
* @return {Array<Array<Object>>} Массив с созданными связками.
* */
function createLessonTeachers(lessonTeachers) {
    return knex('lesson_teachers')
        .insert(lessonTeachers, ["lesson_id", "teacher_id"])
}

module.exports = {
    getLessonTeachersByLessonId: getLessonTeachersByLessonId,
    createLessonTeacher: createLessonTeachers
}