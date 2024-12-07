import initPool from '../databases/connection.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

export const getProfilUsers = async (request,response) => {
    try {
        const user_id = request.params.user_id;
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(
            `SELECT users.username, detail_user.tipe_diabetes, detail_user.user_umur, detail_user.nama_lengkap_user, users.user_email, detail_user.jenis_kelamin, detail_user.foto
            FROM detail_user    
            INNER JOIN users 
            ON users.user_id = detail_user.user_id 
            WHERE detail_user.user_id = ${user_id};`);
        conn.release();
        if (query.length == 0) {
            response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'Data Not Found'
            })
        }
        response.status(200).json({
            statusCode: 200,
            error: false,
            message: 'success',
            data: query[0]
        });
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }


}

export const editProfilUsers = async (request,response) => {
    try {

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        
        const keyFilename = path.join(__dirname, 'keys', 'credentialsFoto.json');

       
        const storage = new Storage({ keyFilename });
        const bucket = storage.bucket('bucketfotoprofil');

        const pool = await initPool();
        const conn = await pool.getConnection();
        const user_id = request.params.user_id;
        const {namaLengkap,username,jenisKelamin,umur} = request.body;
        

        if (!namaLengkap || !username || !jenisKelamin || !umur) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }

        const [query] = await conn.query(`SELECT * FROM users WHERE user_id = ?;`,[user_id]);

        if (query[0].username == username) {
            if (!request.file) {
                const [queryupdate] = await conn.query(`
                    UPDATE detail_user 
                    SET nama_lengkap_user = ?, jenis_kelamin = ?, user_umur = ? 
                    WHERE user_id = ?;
                `, [namaLengkap, jenisKelamin, umur, user_id]);
            
                if (queryupdate.affectedRows === 1) {
                    return response.status(200).json({
                        statusCode: 200,
                        error: false,
                        message: 'success',
                        describe: 'Update Data Berhasil'
                    });
                } else {
                    return response.status(500).json({
                        statusCode: 500,
                        error: true,
                        message: 'error',
                        describe: 'Update Data Gagal'
                    });
                }
            } else {
                const { originalname, mimetype, buffer } = request.file;
                const fileName = Date.now() + '-' + originalname + '-' + user_id;
                const uploadFile = bucket.file(fileName);
            
                await uploadFile.save(buffer, {
                    contentType: mimetype,
                    public: true,
                });
            
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            
                const [queryupdate] = await conn.query(`
                    UPDATE detail_user 
                    SET nama_lengkap_user = ?, jenis_kelamin = ?, user_umur = ?, foto = ? 
                    WHERE user_id = ?;
                `, [namaLengkap, jenisKelamin, umur, publicUrl, user_id]);
            
                if (queryupdate.affectedRows === 1) {
                    return response.status(200).json({
                        statusCode: 200,
                        error: false,
                        message: 'success',
                        describe: 'Update Data Berhasil'
                    });
                } else {
                    return response.status(500).json({
                        statusCode: 500,
                        error: true,
                        message: 'error',
                        describe: 'Update Data Gagal'
                    });
                }
            }            
        }else{
            const [query2] = await conn.query(`SELECT * FROM users WHERE username = ?;`,[username]);
            if (query2.length == 1) {
                return response.status(409).json({
                    statusCode: 409,
                    error: true,
                    message: 'fail',
                    describe: 'Username Conflic'
                }) 
            }else{
                if (!request.file) {
                    const [queryupdate] = await conn.query(`UPDATE users SET username = ? WHERE user_id = ${user_id};`,[username]);
                    const [queryupdate2] = await conn.query(`UPDATE detail_user SET nama_lengkap_user = ?, jenis_kelamin = ?, user_umur = ? WHERE user_id = ${user_id};`,[namaLengkap,jenisKelamin,umur]);
                    if (queryupdate.affectedRows == 1 && queryupdate2.affectedRows == 1) {
                        return response.status(200).json({
                            statusCode: 200,
                            error: false,
                            message: 'success',
                            describe: 'Update Data Berhasil'
                        })
                    }
                }else{
                    const { originalname, mimetype, buffer } = request.file;
                    const fileName = Date.now() + '-' + originalname + '-' + user_id;
                    const uploadFile = bucket.file(fileName);
                
                    await uploadFile.save(buffer, {
                        contentType: mimetype,
                        public: true,
                    });
                
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    const [queryupdate] = await conn.query(`UPDATE users SET username = ? WHERE user_id = ${user_id};`,[username]);
                    const [queryupdate2] = await conn.query(`UPDATE detail_user SET nama_lengkap_user = ?, jenis_kelamin = ?, user_umur = ?, foto = ? WHERE user_id = ${user_id};`,[namaLengkap,jenisKelamin,umur,publicUrl]);
                    if (queryupdate.affectedRows == 1 && queryupdate2.affectedRows == 1) {
                        return response.status(200).json({
                            statusCode: 200,
                            error: false,
                            message: 'success',
                            describe: 'Update Data Berhasil'
                        });
                    }
                }
            }
        }
        conn.release()
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }

    
}


