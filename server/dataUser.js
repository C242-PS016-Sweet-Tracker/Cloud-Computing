import express from 'express';
import {getDetailUser, addDetailUser, editDetailUser} from './handlerDataUser.js'
const router2 = express.Router();



router2.get('/detailUsers/:user_id', getDetailUser)
router2.post('/addDetailUsers', addDetailUser)
router2.put('/editDetailUsers/:user_id', editDetailUser)

export default router2;