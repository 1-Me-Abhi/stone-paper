import express from 'express';
import { startGame, makeMove, getGameStatus } from '../controllers/gameController.js';

const router = express.Router();

router.post('/start', startGame);
router.post('/move', makeMove);
router.get('/status/:gameId', getGameStatus);

export default router;