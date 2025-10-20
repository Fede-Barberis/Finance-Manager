// routes/goals.js
import express from 'express';
import goalsControllers from '../controllers/goalControllers.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.post('/', authenticateToken, goalsControllers.createGoal);
router.put('/:id', authenticateToken, goalsControllers.updateGoal);
router.delete('/:id', authenticateToken, goalsControllers.deleteGoal);

// Filtros (deben ir antes que las rutas con /:id)
router.get('/filter/name', authenticateToken, goalsControllers.getGoalByName);
router.get('/filter/state', authenticateToken, goalsControllers.getGoalByState);

// Contribuciones
router.post('/contribution', authenticateToken, goalsControllers.addContribution);
router.delete('/contribution/:goal_id/:nro_contribution', authenticateToken, goalsControllers.deleteContribution);
router.get('/contribution/goal/:goal_id', authenticateToken, goalsControllers.getContributionsByGoal);

// Obtener todas las ahorros del usuario autenticado
router.get('/', authenticateToken, goalsControllers.getGoalByUser);

// Obtener ahorro por ID (siempre al final)
router.get('/:id', authenticateToken, goalsControllers.getGoalById);


export default router; 