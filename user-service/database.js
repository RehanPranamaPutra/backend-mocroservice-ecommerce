const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'user_db',     // user_db
    process.env.DB_USER || 'postgres',     // postgres
    process.env.DB_PASSWORD || 'password123', // password123
    {
        host: process.env.DB_HOST, // user-db (nama service di docker)
        dialect: 'postgres', 
        port : process.env.DB_PORT || 5432,      // Tetap pakai Postgres
        logging: false,            // Agar terminal bersih
    }
);

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

module.exports = sequelize;