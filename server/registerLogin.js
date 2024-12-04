import initPool from '../databases/connection.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';
import validator from 'validator';


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


// Proses Pengiriman OTP untuk registrasi
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


//Format Email resend OTP
const resendOtpEmail = (email, otp) => {
    return new Promise((resolve, reject) => {
        const mailTemplate = {
            from: 'verifysweettracker@gmail.com',
            to: email, 
            subject: 'Kode OTP anda untuk ke aplikasi Sweet Tracker',
            text: `Halo,\n\n` +
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


//Format email untuk reset password
const resetPasswordEmail = (email, newotp, username) => {
    return new Promise((resolve, reject) => {
        const mailTemplate = {
            from: 'verifysweettracker@gmail.com',
            to: email,
            subject: 'Reset Password Sweet Tracker',
            text: `Halo ${username},\n\n` +
            `Kami menerima permintaan untuk mereset password akun Anda di aplikasi Sweet Tracker. Berikut adalah kode OTP untuk mereset password Anda:\n\n` +
            `Kode OTP Anda adalah: ${newotp}\n\n` +
            `Harap masukkan kode OTP ini di aplikasi kami untuk melanjutkan proses reset password.\n\n` +
            `Jika Anda tidak merasa melakukan permintaan ini, harap abaikan email ini.\n\n` +
            `Mohon untuk tidak membagikan kode OTP ini kepada orang lain!.\n\n` +
            `Terima kasih,\n` +
            `Tim Sweet Tracker\n`,
            };

            transporter.sendMail(mailTemplate, (error, info) => {
                if (error) {
                    reject(`Email Error: ${error.message}`);
                } else {
                    resolve('Email Sent');
                }
            })
        })};


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

        //validasi form kosong atau tidak
        if (!email || !password || !username) {
            return response.status(400).json({
                statusCode: 400,
                error :true,
                message: 'Request Failed',
                describe: 'Please Check Your Format'
            })
            
        }

        // Validasi Menggunakan '@' pada email

        if (!validator.isEmail(email)) {
            return response.status(400).json({
                statusCode: 400,
                error :true,
                message: 'Request Failed',
                describe: 'Format Email Fail'
            })
            
        }
        
        // Validasi Email benar ada atau fake
        const emailYesOrNo = await validOrNoEmail(email);
        if (!emailYesOrNo) {
            return response.status(400).json({
                statusCode: 400,
                error :true,
                message: 'Email Error',
                describe: 'Gagal mengirim email, periksa email yang dimasukkan'
            });
        }

        // Validasi cek User sudah ada apa belum
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [user_cek] = await conn.query(`SELECT username FROM users WHERE username = ?;`,[username]);
        const [email_cek] = await conn.query(`SELECT user_email FROM users WHERE user_email = ?;`,[email]);

        if (user_cek.length == 1 || email_cek.length == 1) {
            return response.status(409).json({
                statusCode: 409,
                error :true,
                message: 'Fail',
                describe: 'Users or Email Conflic'
            });
        }


        const salt = "sjdgegywgyryygww1233uew3723623627"
        const hashpassword = crypto.createHash('sha256').update(password + salt).digest('hex');

        
        await sendOtpEmail(email, otp, username); 

       
        const [dbquery] = await conn.query(`INSERT INTO otp_codes (username,email,password,otp_code,expired_at) VALUES (?, ?, ?, ?, ?);`,[username,email,hashpassword,otp,expired]);
        conn.release();
        if (dbquery.affectedRows == 1) {
            return response.status(201).json({
                statusCode: 201,
                error :false,
                message: 'success',
                describe: 'OTP berhasil dikirim silahkan cek email'
            });
        }
    } catch (error) {
        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }

}



// Melakukan verifikasi OTP dari yang diterima di email
export const verifyOTP = async (request,response) => {

    try {

        const {email,otp} = request.body;
        const dateNow = new Date();

        if (!otp) {
            return response.status(400).json({
                statusCode: 400,
                error :true,
                message: 'OTP Error',
                describe: 'OTP Kosong'
            });
        }
        
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM otp_codes WHERE email = ? and otp_code = ?;`,[email,otp]);

        if (query.length == 0) {
            return response.status(401).json({
                statusCode: 401,
                error: true,
                message: 'Unauthorized',
                describe: 'Maaf Kode OTP Tidak Valid',

            });

        }else if((new Date(query[0].expired_at) < dateNow )){
            return response.status(401).json({
                statusCode: 401,
                error: true,
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
                error :false,
                message: 'success',
                describe: 'Registrasi Anda Berhasil Silahkan Login'
            })
        }

    } catch (error) {

        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }
    
}



// Melakukan request ulang OTP ketika sudah kadaluarsa 5 menit
export const resendingOTP = async (request, response) => {
    
    try {

        const {email,} = request.body
        const newotp = generateOtp();
        const newexpired = new Date(Date.now() + 5 *  60 * 1000);

        if (!email) {
            return response.status(400).json({
              statusCode:400,
              error: true,
              message: "Request Failed. Please Check Your Format",
              loginResult: null,
            });
          }

        
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`UPDATE otp_codes SET otp_code = ?, expired_at = ? WHERE email = "${email}";`,[newotp,newexpired]);
        conn.release()
        
        if (query.affectedRows == 0) {
            return response.status(404).json({
                statusCode: 404,
                error :true,
                message: 'Not Found',
            });
        }
        
        await resendOtpEmail(email, newotp); 

        return response.status(200).json({
            statusCode: 200,
            error :false,
            message: 'success',
            describe: 'OTP sudah diperbarui cek ulang email anda'
        })

    } catch (error) {

        if (error === 'Email Error') {
            return response.status(400).json({
                statusCode: 400,
                error :true,
                message: 'Email Error',
                describe: 'Gagal mengirim email, periksa email yang dimasukkan'
            });
        }

        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }

}


// Login setelah melakukan registrasi
export const login = async (request, response) => {

    try {

        const {usernameOrEmail,password} = request.body
        const salt = "sjdgegywgyryygww1233uew3723623627"
        const hashpassword = crypto.createHash('sha256').update(password + salt).digest('hex');
        const token = crypto.randomBytes(8).toString('hex');

        if (!usernameOrEmail || !password) {
            return response.status(400).json({
              error: true,
              message: "Request Failed. Please Check Your Format",
              loginResult: null,
            });
          }

        const pool = await initPool();
        const conn = await pool.getConnection();

        if (validator.isEmail(usernameOrEmail)) {
            const [query] = await conn.query(`SELECT * FROM users WHERE user_email = ? AND user_password = ?;`,[usernameOrEmail, hashpassword]);
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

        }else{
            const [query] = await conn.query(`SELECT * FROM users WHERE username = ? AND user_password = ?;`,[usernameOrEmail, hashpassword]);
            if (query.length === 0) {
                return response.status(404).json({
                  error: true,
                  message: "User Not Found",
                  loginResult: null,
                });
            }
            conn.release();
      
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
        }
      
    } catch (error) {
          console.error("Login Error:", error.message);
          return response.status(500).json({
            error: true,
            message: "Internal Server Error",
            loginResult: null,
      });
    }

}

//Reset password based on email

export const resetPasswordOTP = async (request, response) => {
    
        try {
            const {email} = request.body;
            const newotp = generateOtp();

            if (!email) {
                return response.status(400).json({
                  statusCode: 400,
                  error: true,
                  message: "Request Failed. Please Check Your Format",
                  loginResult: null,
                });
              }
    
            const pool = await initPool();
            const conn = await pool.getConnection();
            const [query] = await conn.query(`SELECT * FROM users WHERE user_email = ?;`,[email]);
            conn.release();
    
            if (query.length === 0) {
                return response.status(404).json({
                    statusCode: 404,
                    error :true,
                    message: 'Not Found',
                    describe: 'Email Tidak Terdaftar'
                });
            }
    
            
            const pool2 = await initPool();
            const conn2 = await pool2.getConnection();
            const [query2] = await conn2.query(`INSERT INTO otp_password (email,password,otp_password) VALUES ( ?, ?, ?);`,[email,query[0].user_password,newotp]);
            conn2.release();

            await resetPasswordEmail(email, newotp, query[0].username);
    
            if (query2.affectedRows == 1) {
                return response.status(201).json({
                    statusCode: 201,
                    error :false,
                    message: 'success',
                    describe: 'Kode OTP berhasil dikirim silahkan cek email'
                });
            }
    
        } catch (error) {
            console.error(error)
            return response.status(500).json({
                statusCode: 500,
                error:true,
                message: 'Internal Server Error',
            });
        }

}

export const verifyOTPpass = async (request, response) => {

    try {

        const {otp,password} = request.body;
        const salt = "sjdgegywgyryygww1233uew3723623627"
        const hashpassword = crypto.createHash('sha256').update(password + salt).digest('hex');

        if (!otp || !password) {
            return response.status(400).json({
              statusCode:400,
              error: true,
              message: "Request Failed. Please Check Your Format",
              loginResult: null,
            });
          }

        const pool = await initPool()
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM otp_password WHERE otp_password = ?;`,[otp]);
        

        if (query.length == 0) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'Fail',
                describe: 'Not Found'
            });
        }

        const [result] = await conn.query(`UPDATE users SET user_password = ?  WHERE user_email = "${query[0].email}";`,[hashpassword]);
        if (result.affectedRows == 1) {
            const [delOTP] = await conn.query('DELETE FROM otp_password WHERE otp_password = ?;',[otp]);
            conn.release();
            return response.status(201).json({
                statusCode: 201,
                error :false,
                message: 'success',
                describe: 'Password Berhasil Di reset'
            })

        }
    } catch (error) {
        console.error(error)
        return response.status(500).json({
            statusCode: 500,
            error:true,
            message: 'Internal Server Error',
        });
    }


}