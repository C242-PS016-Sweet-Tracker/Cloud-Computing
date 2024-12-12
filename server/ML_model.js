import express from 'express';
import { scanImage,makan, getAnalisis } from './handlerScanMl.js';
const router5 = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router5.post('/predict',upload.single('image'), scanImage);
router5.post('/add',upload.single('image'), makan);
router5.get('/hasilAnalisa/:user_id', getAnalisis);

export default router5; 