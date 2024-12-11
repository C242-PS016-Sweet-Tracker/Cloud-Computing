import initPool from "../databases/connection.js";
import axios from "axios";


export const rekomendasi = async (request, response) => {

    try {
        const { tipe } = request.body;
        if (!tipe) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
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
            rekomendasi: result2
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