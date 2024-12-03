import express from 'express';
import { requestOTP, resendingOTP, verifyOTP, login } from './registerLogin.js';
const router = express.Router();


router.post('/requestOTP',requestOTP)
router.post('/verifyOTP',verifyOTP)
router.post('/resendingOTP',resendingOTP)
router.post('/login',login)



export default router;