import express from 'express';
import { scanImage } from './handlerOcr.js';
const router6 = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router6.post('/predict',upload.single('image'), scanImage);

export default router6;