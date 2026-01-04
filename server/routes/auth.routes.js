import express from 'express';
import validateRequest from '../middleware/validate-request.middleware.js';
import { googleLoginSchema } from '../validations/user.validation.js';
import {
  googleLogin,
  logout
} from '../controllers/auth.controller.js';

const router = express.Router();


/**
 * Auth Routes
 */
router.post(
  '/google',
  validateRequest(googleLoginSchema),
  googleLogin
);

router.post('/logout', logout);

export default router;
