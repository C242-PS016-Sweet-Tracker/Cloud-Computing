import express from 'express';
import { updateKalori, getKalori, getKaloriHarian, updateKaloriHarian, delete24jamCron, delete24jam } from './handlerKalori.js';
const router4 = express.Router();

router4.put('/updateKalori/:user_id',updateKalori);
router4.get('/getKalori/:user_id', getKalori);
router4.get('/getKaloriHarian/:user_id', getKaloriHarian);
router4.put('/updateKaloriHarian/:user_id', updateKaloriHarian);
router4.put('/deletekaloriharian',delete24jamCron);
router4.put('/deletekaloriharianapi', delete24jam);

export default router4;