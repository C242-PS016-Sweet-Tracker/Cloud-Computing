import express from 'express';
import { scanImage } from './handlerScanMl.js';
const router5 = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

router5.post('/predict',upload.single('image'), scanImage);

export default router5;