import express from 'express';
import { updateKalori, getKalori, getKaloriHarian, updateKaloriHarian } from './handlerKalori.js';
const router4 = express.Router();

router4.put('/updateKalori/:user_id',updateKalori);
router4.get('/getKalori/:user_id', getKalori);
router4.get('/getKaloriHarian/:user_id', getKaloriHarian);
router4.put('/updateKaloriHarian/:user_id', updateKaloriHarian);

export default router4;