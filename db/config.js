// Database configuration
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './server/data/survey_processor.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './server/data/survey_processor.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};