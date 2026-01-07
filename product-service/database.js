const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,     // Sesuai dengan docker-compose
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: 3306, // Kunci di 3306 agar tidak bentrok dengan Postgres
        logging: false,
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to MySQL Product DB established successfully.');
    } catch (error) {
        console.error('Unable to connect to the MySQL database:', error);
    }
};

testConnection();

module.exports = sequelize;