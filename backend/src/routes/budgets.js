// routes/budgets.js
import express from 'express';
import budgetController from '../controllers/budgetControllers.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.post('/', authenticateToken, budgetController.createBudget);
router.put('/:id', authenticateToken, budgetController.updateBudget);  
router.delete('/:id', authenticateToken, budgetController.deleteBudget);

// Obtener todas las transacciones del usuario autenticado
router.get('/', authenticateToken, budgetController.getBudgetByUser);

// Obtener transacción por ID
router.get('/:id', authenticateToken, budgetController.getBudgetById);

// Filtros
router.get('/filter/name', authenticateToken, budgetController.getBudgetByName);
router.get('/filter/estado', authenticateToken, budgetController.getBudgetByState);


export default router;