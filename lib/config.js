module.exports = {
     port: process.env.PORT || 8080,

     db: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          pass: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE
     }
}