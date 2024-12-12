import express from 'express';
import { scanImage, makan } from './handlerOcr.js';
const router6 = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router6.post('/predict',upload.single('image'), scanImage);
router6.post('/add',upload.single('image'), makan);


export default router6;