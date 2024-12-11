import express from 'express';
import {rekomendasi} from './handlerRekomendasi.js';
const router7 = express.Router();


router7.post('/', rekomendasi);

export default router7;