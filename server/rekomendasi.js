import express from 'express';
import {rekomendasi,addFavorit,getFavorit} from './handlerRekomendasi.js';
const router7 = express.Router();


router7.post('/', rekomendasi);
router7.post('/addfavorit', addFavorit);
router7.get('/getFavorit/:user_id', getFavorit);

export default router7;