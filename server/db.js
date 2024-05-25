const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql' // или 'postgres', в зависимости от вашей СУБД
});

//
// module.exports = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     dialect: "mysql",
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//   }
// );
