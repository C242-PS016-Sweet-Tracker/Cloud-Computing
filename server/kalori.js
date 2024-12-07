import express from 'express';
import { updateKalori, getKalori } from './handlerKalori.js';
const router4 = express.Router();

router4.put('/updateKalori/:user_id',updateKalori);
router4.get('/getKalori/:user_id', getKalori);

export default router4;