import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import { STATUS_CODES } from '../utils/responseHandler.js';
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(STATUS_CODES.OK).json({
    success: true,
    message: 'Recipe Nest API is running',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;