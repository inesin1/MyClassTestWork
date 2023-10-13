const Router = require('koa-router');
const db = require('../db/queries');
const dateConvert = require('../additions/date-convert')

const router = new Router();

// Обработка запроса на получение занятий
router.get('/', async (ctx) => {
    try {
        // Получаем фильтры из строки запроса
        const filters = ctx.request.query;

        // Получаем все занятия
        const lessons = await db.lessons.getLessons(filters.page, filters.lessonsPerPage);

        // Перебираем полученные занятия
        for (const lesson of lessons) {
            const lessonStudents = await db.lesson_students.getLessonStudentsByLessonId(lesson.id);
            const lessonTeachers = await db.lesson_teachers.getLessonTeachersByLessonId(lesson.id);

            // Добавляем к занятию кол-во учеников, посетивших занятие
            lesson.visitCount = 0;

            // Добавляем к занятию массив учеников
            lesson.students = [];
            for (const lessonStudent of lessonStudents) {
                // Получаем ученика
                const student = await db.students.getStudentById(lessonStudent.student_id);

                // Если посетил урок, добавляем посещение
                if (lessonStudent.visit) {
                    lesson.visitCount++;
                }

                // Добавляем ученика в массив
                lesson.students.push({
                    id: student.id,
                    name: student.name,
                    visit: lessonStudent.visit
                })
            }

            // Добавляем к занятию массив учителей
            lesson.teachers = [];
            for (const lessonTeacher of lessonTeachers) {
                // Получаем учителя
                const teacher = await db.teachers.getTeacherById(lessonTeacher.teacher_id);

                // Добавляем учителя в массив
                lesson.teachers.push(teacher);
            }
        }

        // Фильтруем их
         const lessonsFiltered = lessons.filter(lesson => {
            let isValid = true;
            for (const key in filters) {
                switch (key) {
                    case 'status':
                        isValid = isValid &&
                            lesson[key] == filters[key];
                        break;

                    case 'teacherIds':
                        if (filters[key].includes(',')) {
                            const teacherIds = filters[key].split(',');
                            isValid = isValid &&
                                teacherIds.some(
                                    e => lesson.teachers.map(t => t.id)
                                        .includes(Number(e))
                                );
                        }
                        else {
                            isValid = isValid &&
                                lesson.teachers.includes(Number(filters[key]));
                        }
                        break;

                    case 'studentsCount':
                        // Если два числа
                        if (filters[key].includes(',')) {
                            const range = filters[key].slice(',');
                            isValid = isValid &&
                                range[0] <= lesson.students.length <= range[1];
                        }
                        // Если одно число
                        else {
                            isValid = isValid &&
                                filters[key] == lesson.students.length;
                        }
                        break;

                    case 'page':
                    case 'lessonsPerPage':
                        continue;

                    case 'date':
                        // Если указано две
                        if (filters[key].includes(',')) {
                            const dates = filters[key].slice(',');

                            const startDate = new Date(dates[0]);
                            const endDate = new Date(dates[1])
                            const lessonDate = new Date(lesson[key])

                            isValid = isValid &&
                                lessonDate > startDate && lessonDate < endDate;
                        }
                        // Если указана одна
                        else {
                            isValid = isValid &&
                                dateConvert.convertToDateString(lesson[key]) === filters[key];
                        }
                        break;

                    default:
                        ctx.throw(400, 'Некорректные параметры запроса');
                        break;
                }
            }
            return isValid;
        });

        // Возвращаем ответ
        ctx.body = {
            status:'success',
            data: lessonsFiltered
        }
    } catch (err) {
        ctx.throw(400, err);
    }
});

// Обработка запроса на создание занятий
router.post('/lessons', async (ctx) => {
    try {
        // Получаем тело запроса
        const reqBody = ctx.request.body;

        // Обрабатываем одновременное использование параметров lessonsCount и lastDate
        if (reqBody.lessonsCount && reqBody.lastDate) {
            ctx.throw(400, 'Нельзя одновременно использовать параметры lessonsCount и lastDate')
        }

        // Создаем массивы для хранения занятий и связок
        const lessons = [];
        const lessonTeachers = [];

        // Берем первую дату
        let date = new Date(reqBody.firstDate);

        // Если указан параметр lessonsCount
        if (reqBody.lessonsCount) {
            for (let i = 0; i < reqBody.lessonsCount; i++) {

                // Перебираем даты, начиная с первой.
                // Если в этот день недели нужно создать занятие - оставляем,
                // иначе - добавляем 1 день
                while (!reqBody.days.includes(date.getDay())) {
                    date.setDate(date.getDate() + 1);
                }

                // Добавляем занятие в массив
                lessons.push(
                    {
                        date: dateConvert.convertToDateString(date),
                        title: reqBody.title,
                        status: 0,
                    }
                );

                // Добавляем к дате 1 день
                date.setDate(date.getDate() + 1);
            }
        }
        // Если указан параметр lastDate
        else if (reqBody.lastDate) {
            // Дата начала, дата конца и дата начала через год, для ограничения
            const firstDate = new Date(reqBody.firstDate);
            const lastDate = new Date(reqBody.lastDate);
            const firstDateYearLater = new Date(firstDate.getFullYear() + 1, firstDate.getMonth(), firstDate.getDate());

            // Добавляем уроки пока дата создания меньше, чем параметр lastDate
            do {
                // Перебираем даты, начиная с первой.
                // Если в этот день недели нужно создать занятие - оставляем,
                // иначе - добавляем 1 день
                while (!reqBody.days.includes(date.getDay())) {
                    date.setDate(date.getDate() + 1);
                }

                // Добавляем занятие в массив
                lessons.push(
                    {
                        date: dateConvert.convertToDateString(date),
                        title: reqBody.title,
                        status: 0,
                    }
                );

                // Добавляем к дате 1 день
                date.setDate(date.getDate() + 1);
            } while (
                date < lastDate &&
                date < firstDateYearLater &&
                lessons.length < 300
                );
        }

        // Создаем уроки в базе данных
        const lessonIds = await db.lessons.createLessons(lessons);

        // Для каждого урока и учителя создаем связку
        lessonIds.forEach(lessonId => {
            reqBody.teacherIds.forEach(teacherId => {
                // Добавляем в массив
                lessonTeachers.push({
                    lesson_id: lessonId.id,
                    teacher_id: teacherId
                });
            });
        });

        // Создаем связки урок-учитель в базе данных
        await db.lesson_teachers.createLessonTeacher(lessonTeachers);

        ctx.body = {
            status: 'success',
            data: lessonIds.map(lId => lId.id)
        }
    } catch (err) {
        ctx.throw(400, err)
    }
})

module.exports = router