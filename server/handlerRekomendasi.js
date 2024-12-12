import initPool from "../databases/connection.js";
import axios from "axios";


export const rekomendasi = async (request, response) => {

    try {
        const { tipe } = request.body;
        if (!tipe) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            })
        }

        
        const getres = await axios.post('http://34.101.36.31:5050/rekomendasi',{tipe: tipe},{
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = getres.data.Rekomendasi
        const result2 = [];

        for (const element of result) {
            const imageMakanan = element['Nama Makanan'].split(" ").join("");
            const data = {
                nama_makanan: element['Nama Makanan'],
                kalori: element['Kalori'],
                karbohidrat: element['Karbohidrat'],
                lemak: element['Lemak'],
                protein: element['Protein'],
                serat: element['Serat'],
                img: `https://storage.googleapis.com/makananbucket/${imageMakanan}.jpg`
            }
            result2.push(data)
        }
        return response.status(200).json({
            statusCode: 200,
            error: false,
            message: 'success',
            rekomendasi: result2[0]
        })
    } catch (error) {
        console.log("Error:", error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: "Internal Server Error",
        });
    }
}

export const addFavorit = async(request,response) => {
    try {
        const {user_id,namaMakanan,kalori,karbohidrat,lemak,protein,serat,img} = request.body;
        if (!user_id || !namaMakanan || !kalori || !karbohidrat || !lemak || !protein || !serat || !img) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            })
        }

        const pool = await initPool();
        const conn = await pool.getConnection()
        const [query] = await conn.query(`SELECT * FROM makanan_favorit WHERE nama_makanan = "${namaMakanan}";`)
        if (query.length == 1) {
            return response.status(409).json({
                statusCode: 409,
                error :true,
                message: 'fail',
                describe: 'data conflic'
            });
        }
        const [query2] = await conn.query(`INSERT INTO makanan_favorit(user_id,nama_makanan,kalori,karbohidrat,lemak,protein,serat,img) VALUES (?,?,?,?,?,?,?,?);`,[user_id,namaMakanan,kalori,karbohidrat,lemak,protein,serat,img]);
        if (query2.affectedRows == 1) {
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

export const getFavorit = async (request, response) => {
    try {
        const user_id = request.params.user_id
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM makanan_favorit WHERE user_id = ${user_id}`);
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