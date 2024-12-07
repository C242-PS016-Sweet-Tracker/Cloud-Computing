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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})