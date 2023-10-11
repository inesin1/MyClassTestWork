// Конфиг knex

const config = require('../../lib/config')

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  // Конфиг для разработки
  development: {
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user:     config.db.user,
      password: config.db.pass
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  // Конфиг для прода
  production: {
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user:     config.db.user,
      password: config.db.pass
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  // Конфиг для тестов
  test: {
    client: 'pg',
    connection: {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user:     config.db.user,
      password: config.db.pass
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};
