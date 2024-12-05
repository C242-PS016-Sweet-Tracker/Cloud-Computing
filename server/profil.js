import express from 'express';
import {getProfilUsers,editProfilUsers} from './handlerProfil.js'
const router3 = express.Router();


router3.get('/profilUsers/:user_id', getProfilUsers)
router3.put('/editProfilUsers/:user_id', editProfilUsers)

export default router3; 