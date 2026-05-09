require('dotenv').config();

const base = {
  client: 'pg',
  migrations: { directory: './db/migrations' },
  seeds: { directory: './db/seeds' },
};

module.exports = {
  development: {
    ...base,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'taskflow',
      user: process.env.DB_USER || 'taskflow',
      password: process.env.DB_PASSWORD || 'taskflow',
    },
  },
  test: {
    ...base,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME_TEST || 'taskflow_test',
      user: process.env.DB_USER || 'taskflow',
      password: process.env.DB_PASSWORD || 'taskflow',
    },
  },
  test_e2e: {
    ...base,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'taskflow_test_e2e',
      user: process.env.DB_USER || 'taskflow',
      password: process.env.DB_PASSWORD || 'taskflow',
    },
  },
  production: {
    ...base,
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    pool: { min: 2, max: 10 },
  },
};
