const knex = require('../connection')

/*
* Возвращает связки учителей и занятий по id занятия.
*
* @param {number} lessonId id занятия.
*
* @return {Array<Object>, undefined} Найденные связки или undefined, если не найдена.
* */
function getLessonTeachersByLessonId(lessonId) {
    return knex('lesson_teachers')
        .select('*')
        .where('lesson_id', lessonId);
}

/*
* Создает связки учителей и занятий.
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