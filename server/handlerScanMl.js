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


        const flaskResponse = await axios.post('http://34.128.88.82:6060/predict', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

    
        if (!flaskResponse.data.predicted_class) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'response fail',
            });
        }

        const food = flaskResponse.data.predicted_class

        const apiKey = 'e00deb7e3ea9b622b87c63a78c49fb32';
        const appId = 'ef718f58';
        const nutritionixUrl = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

        const result = await axios.post(nutritionixUrl, {query: food,}, {
            headers: {
                'Content-Type': 'application/json',
                'x-app-id': appId,       
                'x-app-key': apiKey,     
            }
        });

        const foodData = result.data.foods[0];

        return response.status(200).json({
            statusCode: 200,
            error: false,
            message: 'success',
            data: {
                makanan: food,
                kalori: foodData.nf_calories,
                gula: foodData.nf_sugars,
                lemak: foodData.nf_total_fat,
                protein: foodData.nf_protein
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
        const bucket = storage.bucket('hasil_analisis_makanan');

        const {user_id,namaMakanan,kalori,gula,lemak,protein} = request.body

        if (!namaMakanan || !kalori || !gula || !lemak || !protein || !user_id) {
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
        const [query] = await conn.query(`INSERT INTO hasil_analisa_makanan(user_id,nama_makanan,gula,protein,lemak,gambar_analisa_makanan,kalori) VALUES (?,?,?,?,?,?,?);`,[user_id,namaMakanan,gula,protein,lemak,publicUrl,kalori])
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

export const getAnalisis = async (request,response) => {
    try {
        const user_id = request.params.user_id
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM hasil_analisa_makanan WHERE user_id = ${user_id}`);
        conn.release()
        if (query.length >= 1) {
            return response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                data: query
            })
        }else{
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
            });
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
