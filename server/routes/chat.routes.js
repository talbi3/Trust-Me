import express from 'express';
import postChatMessage from '../controllers/chat.controller.js';


const router = express.Router();


/**
 * Read and Write Permission Routes
 */

router.post('/', postChatMessage);


export default router;
