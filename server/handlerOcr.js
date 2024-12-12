import axios from 'axios';
import FormData from 'form-data';
import initPool from '../databases/connection.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

export const scanImage = async (request, response) => {
    try {
        if (!request.file) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'image not found',
            });
        }

    
        const imageBuffer = request.file.buffer;

    
        const originalFileName = request.file.originalname;

        const formData = new FormData();
        formData.append('image', imageBuffer, { filename: originalFileName });


        const flaskResponse = await axios.post('http://34.101.79.78:7070/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

    
        if (!flaskResponse.data.sugar_info) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'response fail',
            });
        }

        const sugar = flaskResponse.data.sugar_info
        const numberkonversi = sugar.match(/\d+(\.\d+)?/g);  


        return response.status(200).json({
            statusCode: 200,
            error: false,
            message: 'success',
            data: {
                gula: numberkonversi[0]
            }
        });
    } catch (error) {
        console.log("Error:", error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: "Internal Server Error",
        });
    }
};


export const makan = async (request,response) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
           
        const keyFilename = path.join(__dirname, 'keys', 'credentialsFoto.json');
    
        const storage = new Storage({ keyFilename });
        const bucket = storage.bucket('ocrmakanan');

        const {gula,user_id} = request.body;
        if (!gula || !user_id) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }

        const { originalname, mimetype, buffer } = request.file;
        const fileName = Date.now() + '-' + user_id;
        const uploadFile = bucket.file(fileName);

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            
        await uploadFile.save(buffer, {
            contentType: mimetype,
            public: true,
        });

        
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`INSERT INTO hasil_analisa_makanan(user_id,gula,gambar_analisa_makanan) VALUES (?,?,?);`,[user_id,gula,publicUrl])
        conn.release()
        if (query.affectedRows == 1) {
            return response.status(201).json({
                statusCode: 201,
                error: false,
                message: 'success',
                describe: 'data berhasil di insert'
            })
        }
        
    } catch (error) {
        console.log("Error:", error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: "Internal Server Error",
        });
    }
}
