import express from 'express';
import cron from 'node-cron'
import router from './authentifikasi.js'
import router2 from './dataUser.js'
import router3 from './profil.js';
import router4 from './kalori.js';
import router5 from './ML_model.js';
import router6 from "./ocr.js";
import router7 from './rekomendasi.js';
import { delete24jamCron } from './handlerKalori.js';

const app = express()
const port = 8080 
app.use(express.json());

app.use('/auth', router);
app.use('/detail', router2);
app.use('/profil', router3);
app.use('/kalori', router4);
app.use('/scan', router5);
app.use('/ocr', router6);
app.use('/rekomendasi', router7);

cron.schedule('0 0 * * *', async () => {
  try {
    await delete24jamCron();  // Panggil fungsi delete24jamCron untuk reset kalori_harian
    console.log('Kalori harian berhasil direset pada hari ini.');
  } catch (error) {
    console.error('Terjadi kesalahan saat mereset kalori harian di cron job:', error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})