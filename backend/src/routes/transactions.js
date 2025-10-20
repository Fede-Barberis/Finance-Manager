// routes/transactions.js
import express from 'express';
import transactionControllers from '../controllers/transactionControllers.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.post('/', authenticateToken, transactionControllers.createTransaction);
router.put('/:id', authenticateToken, transactionControllers.updateTransaction);  
router.delete('/:id', authenticateToken, transactionControllers.deleteTransaction);

// Obtener todas las transacciones del usuario autenticado
router.get('/', authenticateToken, transactionControllers.getTransactionsByUser);

// Obtener transacción por ID
router.get('/:id', authenticateToken, transactionControllers.getTransactionById);

// Filtros
router.get('/filter/type', authenticateToken, transactionControllers.getTransactionsByUserAndType);
router.get('/filter/category', authenticateToken, transactionControllers.getTransactionsByUserAndCategory);
router.get('/filter/date', authenticateToken, transactionControllers.getTransactionsByDateRange);

export default router;