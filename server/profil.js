import express from 'express';
import {getProfilUsers,editProfilUsers} from './handlerProfil.js'
const router3 = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });


router3.get('/profilUsers/:user_id', getProfilUsers)
router3.put('/editProfilUsers/:user_id',upload.single('image'), editProfilUsers)

export default router3; 