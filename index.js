require('dotenv').config()

const Koa = require('koa');
const config = require('./lib/config')
const handlers = require('./handlers')
const router = require('./src/routes/index').routes()

const app = new Koa();
handlers.forEach((h) => app.use(h))
app.use(router)

const server = app.listen(config.port, () => console.log(`Сервер запущен на порту ${config.port}`));

module.exports = server