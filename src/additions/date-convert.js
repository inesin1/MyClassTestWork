/*
* Конвертирует объект Date в корректную строку с датой.
*
* @param {Date} date Объект Date  датой и временем.
*
* @return {String} Строка с датой.
* */
function convertToDateString(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

module.exports = {
    convertToDateString: convertToDateString
}