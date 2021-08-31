module.exports = {
    HOST: (process.env.DB_HOST)? (process.env.DB_HOST): "161.132.121.218",
    USER: (process.env.DB_USER)? (process.env.DB_USER): "newip",
    PASSWORD: (process.env.DB_PASSWORD)? (process.env.DB_PASSWORD) : "$%NIS2020",
    DB: (process.env.DB_NAME)? (process.env.DB_NAME): "db_entel",
    PORT: (process.env.DB_PORT)? (process.env.DB_PORT): 8181,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };