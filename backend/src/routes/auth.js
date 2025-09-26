import express from 'express';
import authController from '../controllers/authControllers.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (no necesitan token)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (necesitan token)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

export default router;