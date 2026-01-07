import express from 'express';
import userRoutes from './user.routes.js';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import uploadRoutes from './upload.routes.js';

const apiRouter = express.Router();


apiRouter.use('/user', userRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/chats', chatRoutes);
export default apiRouter;