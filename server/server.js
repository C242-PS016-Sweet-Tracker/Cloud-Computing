import express from 'express';
import router from './authentifikasi.js'

const app = express()
const port = 8080 
app.use(express.json());

app.use('/auth', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})