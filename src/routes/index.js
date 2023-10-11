const Router = require('koa-router');
const db = require('../db/queries');
const dateConvert = require('../additions/date-convert')

const router = new Router();

router.get('/', async (ctx) => {
    try {
        // Получаем фильтры из строки запроса
        const filters = ctx.request.query;

        // Получаем все уроки и фильтруем их
        const lessons = (await db.lessons.getLessons(filters.page, filters.lessonsPerPage)).filter(lesson => {
            let isValid = true;
            for (key in filters) {
                if (key == 'page' || key == 'lessonsPerPage') {
                    continue;
                }

                if (key == 'date') {
                    // Фильтрация по дате

                    // Если указано две
                    if (filters[key].includes(',')) {
                        const startDate = new Date(filters[key].substring(0, filters[key].indexOf(',')))
                        const endDate = new Date(filters[key].substring(filters[key].indexOf(',') + 1))
                        const lessonDate = new Date(lesson[key])

                        isValid = isValid && lessonDate > startDate && lessonDate < endDate;
                    }
                    // Если указана одна
                    else {
                        isValid = isValid && lesson[key].toDateString() == new Date(filters[key]).toDateString();
                    }

                }
                else
                    // Проверяем совпадение значения в фильтре и в сущности
                    isValid = isValid && lesson[key] == filters[key];
            }
            return isValid;
        });

        for (const lesson of lessons) {
            const studentIds = await db.lesson_students.getStudentsByLesson(lesson.id);
            const teachers = await db.lesson_teachers.getLessonTeachersByLessonId(lesson.id);

            lesson.visitCount = 0;

            lesson.students = [];
            await studentIds.forEach(async s => {
                student = await db.students.getStudentById(s.student_id);

                if (s.visit) {
                    lesson.visitCount++;
                }

                lesson.students.push({
                    id: student.id,
                    name: student.name,
                    visit: s.visit
                })
            });

            lesson.teachers = [];
            await teachers.forEach(async teacher => {
                lesson.teachers.push({
                    id: teacher.teacher_id,
                    name: (await db.teachers.getTeacherById(teacher.teacher_id)).name
                })
            });

            console.log(teachers);
        }

        // Возвращаем ответ
        ctx.body = {
            status:'success',
            data: lessons
        }
    } catch (err) {
        ctx.throw(400, err);
    }
});

router.post('/lessons', async (ctx) => {
    try {
        const reqBody = ctx.request.body;

        if (reqBody.lessonsCount && reqBody.lastDate) {
            ctx.throw(400, 'Нельзя одновременно использовать параметры lessonsCount и lastDate')
        }

        const lessons = [];
        const lessonTeachers = [];

        let date = new Date(reqBody.firstDate);

        if (reqBody.lessonsCount) {
            for (let i = 0; i < reqBody.lessonsCount; i++) {
                while (!reqBody.days.includes(date.getDay())) {
                    date.setDate(date.getDate() + 1);
                }

                lessons.push(
                    {
                        date: dateConvert.convertToDateString(date),
                        title: reqBody.title,
                        status: 0,
                    }
                );

                date.setDate(date.getDate() + 1);
            }
        }
        else if (reqBody.lastDate) {
            do {
                while (!reqBody.days.includes(date.getDay())) {
                    date.setDate(date.getDate() + 1);
                }

                lessons.push(
                    {
                        date: dateConvert.convertToDateString(date),
                        title: reqBody.title,
                        status: 0,
                    }
                );

                date.setDate(date.getDate() + 1);
            } while (date.getTime() < new Date(reqBody.lastDate).getTime());
        }

        const lessonIds = await db.lessons.createLessons(lessons);

        lessonIds.forEach(lessonId => {
            reqBody.teacherIds.forEach(teacherId => {
                lessonTeachers.push({
                    lesson_id: lessonId.id,
                    teacher_id: teacherId
                });
            });
        });

        await db.lesson_teachers.createLessonTeacher(lessonTeachers);
    } catch (err) {
        ctx.throw(400, err)
    }
})

module.exports = router