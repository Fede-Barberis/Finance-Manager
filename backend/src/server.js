import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from '../config/database.js';
import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/categories.js'
import transactionRoutes from './routes/transactions.js'
import budgetRoutes from './routes/budgets.js'

dotenv.config();
const app = express();         
const PORT = process.env.PORT || 5000;

//* Middleware => funciones que se ejecutan antes de cada ruta
app.use(cors())            // Permite CORS para todas las rutas
app.use(express.json())    // Permite leer JSON en los requests


//* Rutas de la api
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)


//* Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API funcionando!',
        status: 'ok'
    })
})

//* Ruta para probar conexion a BD
app.get('/test-db', async (req, res) => { 
    try {
        const connected = await testConnection()
        if(connected) {
            res.json({
                message: 'Conexion a la base de datos establecida correctamente',
                database: process.env.DB_NAME,
                status: 'connected'
            })
        }else {
            res.status(500).json({ 
                message: 'No se pudo conectar a la base de datos',
                status: 'error'
            })
        }
    }
    catch (error) {
        res.status(500).json({ 
            message: 'Error al conectar con la base de datos',
            status: 'error'
        })
    }
})


//* Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

    //Probar conexion a la base de datos al iniciar el servidor
    await testConnection()
})