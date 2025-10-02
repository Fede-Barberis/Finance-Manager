// routes/categories.js
import express from 'express';
import categoryController from '../controllers/categoryControllers.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.get('/', authenticateToken, categoryController.getCategories);
router.get('/filter', authenticateToken, categoryController.getCategoriesByType);
router.post('/', authenticateToken, categoryController.createCategory);
router.put('/:id', authenticateToken, categoryController.updateCategory);  
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

export default router;