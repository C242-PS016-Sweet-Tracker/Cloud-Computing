import initPool from '../databases/connection.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';
import { reset } from 'nodemon';



// Melakukan Generate OTP 6 Digit 
const generateOtp = () => {
    return crypto.randomInt(100000, 999999);
};

// Email Pengirim Kode OTP
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: 'verifysweettracker@gmail.com',  
      pass: 'yjgu uljq cyme susa', 
    },
  });


// Proses Pengiriman OTP
const sendOtpEmail = (email, otp, username) => {
    return new Promise((resolve, reject) => {
        const mailTemplate = {
            from: 'verifysweettracker@gmail.com',
            to: email, 
            subject: 'Kode OTP anda untuk ke aplikasi Sweet Tracker',
            text: `Halo ${username},\n\n` +
            `Terima kasih telah mendaftar di aplikasi Sweet Tracker. Berikut adalah kode OTP untuk menyelesaikan proses verifikasi akun Anda:\n\n` +
            `Kode OTP Anda adalah: ${otp}\n\n` +
            `Harap masukkan kode OTP ini di aplikasi kami untuk melanjutkan pendaftaran. Kode ini hanya berlaku selama 5 menit.\n\n` +
            `Jika Anda tidak merasa melakukan permintaan ini, harap abaikan email ini.\n\n` +
            `Terima kasih,\n` +
            `Tim Sweet Tracker\n`,
        };

        transporter.sendMail(mailTemplate, (error, info) => {
            if (error) {
                reject(`Email Error: ${error.message}`);
            } else {
                resolve('Email Sent');
            }
        });
    });
};


// API untuk mengecek apakah email valid atau tidak
const API_KEY = 'e766cc179b3c8d3f49594072b63e3f4f9cef7d22';
const validOrNoEmail = async (email) => {
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data.data;

        return data.result === 'deliverable' ? true : false;
    } catch (error) {
        console.error('Error verifying email:', error.message);
        return false;
    }
}


// Melakukan Request OTP ketika melakukan registrasi
export const requestOTP = async (request, response) => {

    try {

        const expired = new Date(Date.now() + 5 * 60 * 1000);
        const {username,email,password} = request.body;
        const otp = generateOtp();

        // Validasi Menggunakan '@' pada email
        // Validasi cek User sudah ada apa belum

        if (!email || !password || !username) {
            return response.status(400).json({
                statusCode: 400,
                message: 'Request Failed',
                describe: 'Please Check Your Format'
            })
            
        }

        const emailYesOrNo = await validOrNoEmail(email);
        if (!emailYesOrNo) {
            return response.status(400).json({
                statusCode: 400,
                message: 'Email Error',
                describe: 'Gagal mengirim email, periksa email yang dimasukkan'
            });
        }

        const salt = "sjdgegywgyryygww1233uew3723623627"
        const hashpassword = crypto.createHash('sha256').update(password + salt).digest('hex');

        
        await sendOtpEmail(email, otp); 

        const pool = await initPool();
        const conn = await pool.getConnection();
        const [dbquery] = await conn.query(`INSERT INTO otp_codes (username,email,password,otp_code,expired_at) VALUES (?, ?, ?, ?, ?);`,[username,email,hashpassword,otp,expired]);
        conn.release();
        if (dbquery.affectedRows == 1) {
            return response.status(201).json({
                statusCode: 201,
                message: 'success',
                describe: 'OTP berhasil dikirim silahkan cek email'
            });
        }
    } catch (error) {
        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }

}



// Melakukan verifikasi OTP dari yang diterima di email
export const verifyOTP = async (request,response) => {

    try {

        const {email,otp} = request.body;
        const dateNow = new Date();
        
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM otp_codes WHERE email = ? and otp_code = ?;`,[email,otp]);

        if (query.length == 0) {
            return response.status(401).json({
                statusCode: 401,
                message: 'Unauthorized',
                describe: 'Maaf Kode OTP Tidak Valid',

            });

        }else if((new Date(query[0].expired_at) < dateNow )){
            return response.status(401).json({
                statusCode: 401,
                message: 'Unauthorized',
                describe: 'Maaf Kode OTP Kadaluarsa '
            });
        }

        const [result] = await conn.query('INSERT INTO users (username,user_email,user_password) VALUES (?, ?, ?);', [query[0].username,query[0].email,query[0].password])

        if (result.affectedRows == 1) {
            const [delOTP] = await conn.query('DELETE FROM otp_codes WHERE email = ?;',[email])
            conn.release()
            return response.status(201).json({
                statusCode: 201,
                message: 'success',
                describe: 'Registrasi Anda Berhasil Silahkan Login'
            })
        }

    } catch (error) {

        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
    
}




// Melakukan request ulang OTP ketika sudah kadaluarsa 5 menit
export const resendingOTP = async (request, response) => {
    
    try {

        const {email} = request.body
        const newotp = generateOtp();
        const newexpired = new Date(Date.now() + 5 *  60 * 1000);


        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`UPDATE otp_codes SET otp_code = ?, expired_at = ? WHERE email = "${email}";`,[newotp,newexpired]);
        conn.release()

        if (query.affectedRows == 0) {
            return response.status(404).json({
                statusCode: 404,
                message: 'Not Found',
            });
        }

        await sendOtpEmail(email,newotp);

        return response.status(200).json({
            statusCode: 200,
            message: 'success',
            describe: 'OTP sudah diperbarui cek ulang email anda'
        })

    } catch (error) {

        if (error === 'Email Error') {
            return response.status(400).json({
                statusCode: 400,
                message: 'Email Error',
                describe: 'Gagal mengirim email, periksa email yang dimasukkan'
            });
        }

        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }

}


// Login setelah melakukan registrasi
export const login = async (request, response) => {

    try {

        const {username,password} = request.body
        const salt = "sjdgegywgyryygww1233uew3723623627"
        const hashpassword = crypto.createHash('sha256').update(password + salt).digest('hex');
        const token = crypto.randomBytes(8).toString('hex');

        if (!username || !password) {
            return response.status(400).json({
              error: true,
              message: "Request Failed. Please Check Your Format",
              loginResult: null,
            });
          }
      
          const pool = await initPool();
          const conn = await pool.getConnection();
          const [query] = await conn.query(`SELECT * FROM users WHERE username = ? AND user_password = ?;`,[username, hashpassword]
      );
          conn.release();
      
          if (query.length === 0) {
            return response.status(404).json({
              error: true,
              message: "User Not Found",
              loginResult: null,
            });
          }
      
          const loginResult = {
            name: query[0].username,
            userId: query[0].user_id,
            token: token,
          };
      
          return response.status(200).json({
            error: false,
            message: "success",
            loginResult: loginResult,
          });
        } catch (error) {
          console.error("Login Error:", error.message);
          return response.status(500).json({
            error: true,
            message: "Internal Server Error",
            loginResult: null,
      });
    }

}