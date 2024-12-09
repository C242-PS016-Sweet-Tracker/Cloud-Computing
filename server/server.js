import express from 'express';
import router from './authentifikasi.js'
import router2 from './dataUser.js'
import router3 from './profil.js';
import router4 from './kalori.js';

const app = express()
const port = 8080 
app.use(express.json());

app.use('/auth', router);
app.use('/detail', router2);
app.use('/profil', router3);
app.use('/kalori', router4);

//Ini 1 menit, belum diganti ke 24 jam
// cron.schedule('* * * * *', async () => {
//   try {
//     await delete24jamCron();  // Panggil fungsi delete24jamCron untuk reset kalori_harian
//     console.log('Kalori harian berhasil direset pada menit ini.');
//   } catch (error) {
//     console.error('Terjadi kesalahan saat mereset kalori harian di cron job:', error);
//   }
// });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})