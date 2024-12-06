import initPool from '../databases/connection.js';


export const getDetailUser = async (request,response) => {
    try {
        const user_id = request.params.user_id
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT * FROM detail_user WHERE user_id = ?;`,[user_id]);
        conn.release();
        if (query.length == 0) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'Data Not Found'
            })
        }
        return response.status(200).json({
            statusCode: 200,
            error: false,
            message: 'success',
            data: query
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

export const addDetailUser = async (request, response) => {
    try {
        const {namaLengkap,jenisKelamin,umur,tinggiBadan,beratBadan,tingkatAktifitas,tipeDiabetes,kadarGula,kalori,user_id} = request.body;

        if (!namaLengkap || !jenisKelamin || !umur || !tinggiBadan || !beratBadan || 
            !tingkatAktifitas || !tipeDiabetes || !kadarGula || !kalori || !user_id) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }
    
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(
            `INSERT INTO detail_user (
                nama_lengkap_user, 
                jenis_kelamin,  
                user_umur, 
                tinggi_badan, 
                berat_badan, 
                tingkat_aktivitas, 
                tipe_diabetes, 
                kadar_gula, 
                kalori, 
                user_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?);`,[namaLengkap,jenisKelamin,umur,tinggiBadan,beratBadan,tingkatAktifitas,tipeDiabetes,kadarGula,kalori,user_id]);
        conn.release();
        if (query.affectedRows == 1) {
            return response.status(201).json({
                statusCode: 200,
                error: false,
                message: 'success',
                describe: 'Insert Data Berhasil'
            });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }

}

export const editDetailUser = async (request, response) => {
    try {
        const user_id = request.params.user_id;
        const {namaLengkap,jenisKelaminumur,tinggiBadan,beratBadan,tingkatAktifitas,tipeDiabetes,kadarGula,kalori} = request.body;

        if (!namaLengkap || !jenisKelamin  || !umur || !tinggiBadan || !beratBadan || 
            !tingkatAktifitas || !tipeDiabetes || !kadarGula || !kalori) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }

        const pool = await initPool();
        const conn = await pool.getConnection()
        const [query] = await conn.query(
            `UPDATE detail_user 
             SET 
                nama_lengkap_user = ?, 
                jenis_kelamin = ?, 
                user_umur = ?, 
                tinggi_badan = ?, 
                berat_badan = ?, 
                tingkat_aktivitas = ?, 
                tipe_diabetes = ?, 
                kadar_gula = ?, 
                kalori = ? 
             WHERE user_id = ${user_id};`,
            [namaLengkap, jenisKelamin, umur, tinggiBadan, beratBadan, tingkatAktifitas, tipeDiabetes, kadarGula, kalori]
        );
        if (query.affectedRows == 1) {
            response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                describe: 'Update Data Berhasil'
            })
            
        }

    } catch (error) {
        console.log(error);
        return response.status(500).json({
            statusCode: 500,
            error: true,
            message: 'Internal Server Error',
        });
    }
}