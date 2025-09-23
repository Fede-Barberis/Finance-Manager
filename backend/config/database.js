import mysql from 'mysql2/promise';
import dotenv from 'dotenv';   

dotenv.config()

//* Configuracion de la base de datos 
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finance_manager',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

//* Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

//* Funcion para probar la conexion
const testConnection = async () => {
    try {
        const connection = await pool.getConnection()
        console.log('✅ Conexion a MySQL (base de datos) establecida correctamente');
        connection.release();
        return true
    }
    catch (error) {
        console.error('Error de conexion con la base de datos:', error);
        return false
    }
}

export { pool, testConnection }