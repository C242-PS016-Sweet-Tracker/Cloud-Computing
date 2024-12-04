import express from 'express';
import { requestOTP, resendingOTP, verifyOTP, login, resetPasswordOTP, verifyOTPpass } from './registerLogin.js';
const router = express.Router();


router.post('/requestOTP',requestOTP)
router.post('/verifyOTP',verifyOTP)
router.post('/resendingOTP',resendingOTP)
router.post('/login',login)
router.post('/resendingOTPpassword',resetPasswordOTP)
router.post('/verifyResetPass', verifyOTPpass)



export default router;