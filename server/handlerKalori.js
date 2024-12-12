import initPool from "../databases/connection.js";

export const updateKalori = async (request,response) => {

    try {
        const pool = await initPool();
        const conn = await pool.getConnection();
        const user_id = request.params.user_id;
        
        const {kalori} = request.body;
        if (!kalori) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }
        
        const [query] = await conn.query(`UPDATE detail_user SET kalori = ? WHERE user_id = ?;`,[kalori,user_id]);
        conn.release();
        if (query.affectedRows == 1) {
            return response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                describe: 'kalori berhasil di update'
            })
        }else{
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
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

export const getKalori = async (request,response) => {
    try {
        const pool = await initPool();
        const conn = await pool.getConnection();

        const user_id = request.params.user_id;
        const [query] = await conn.query(`
            SELECT users.username, detail_user.kalori, detail_user.kalori_harian, detail_user.tipe_diabetes  FROM detail_user 
            INNER JOIN users
            ON users.user_id = detail_user.user_id
            WHERE detail_user.user_id = ${user_id};
            `);
        conn.release();
        if (query.length == 0) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
            })
        }else{
            return response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                data: query[0]
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

export const getKaloriHarian = async (request,response) => {

    try {
        const user_id = request.params.user_id;
        const pool = await initPool();
        const conn = await pool.getConnection();
        const [query] = await conn.query(`SELECT nama_lengkap_user,kalori_harian FROM detail_user WHERE user_id = ${user_id};`);
        conn.release();
        if (query.length == 0) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
            });
        }else{
            return response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                data: query[0]
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

export const updateKaloriHarian = async (request, response) => {
    
    try {
        const pool = await initPool();
        const conn = await pool.getConnection();

        const user_id = request.params.user_id;
        const {kaloriAdd} = request.body;
        if (!kaloriAdd) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'check your format'
            });
        }

        const [cekkalori] = await conn.query(`SELECT kalori,kalori_harian FROM detail_user WHERE user_id = ${user_id};`)
        if (cekkalori[0].kalori_harian + kaloriAdd > cekkalori[0].kalori) {
            return response.status(400).json({
                statusCode: 400,
                error: true,
                message: 'fail',
                describe: 'jika anda memakan makanan ini maka melebihi kalori harian anda'
            })
        }

        const [query] = await conn.query(`UPDATE detail_user SET kalori_harian = kalori_harian + ? WHERE user_id = ?;`,[kaloriAdd, user_id]);
        conn.release();
        if (query.affectedRows == 0) {
            return response.status(404).json({
                statusCode: 404,
                error: true,
                message: 'fail',
                describe: 'data not found'
            });
        }else{
            return response.status(200).json({
                statusCode: 200,
                error: false,
                message: 'success',
                describe: 'update data berhasil'
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

// Fungsi untuk dipanggil via cron (tanpa req dan res)
export const delete24jamCron = async () => {
    try {
      const pool = await initPool();
      const conn = await pool.getConnection();
  
      const [result] = await conn.query('UPDATE detail_user SET kalori_harian = 0');
      
      conn.release();
  
    //   if (result.affectedRows > 0) {
    //     console.log('Kalori Harian berhasil di-reset untuk semua pengguna.');
    //   } else {
    //     console.log('Tidak ada data yang ditemukan untuk di-reset.');
    //   }
    } catch (error) {
      console.error('Terjadi kesalahan saat mereset kalori harian di cron job:', error);
    }
  };
  
  // Fungsi untuk dipanggil via HTTP request (dengan req dan res)
  export const delete24jam = async (req, res) => {
    try {
      const pool = await initPool();
      const conn = await pool.getConnection();
  
      const [result] = await conn.query('UPDATE detail_user SET kalori_harian = 0');
      
      conn.release();
  
      if (result.affectedRows > 0) {
        res.status(200).json({
          statusCode: 200,
          error: false,
          message: 'Kalori Harian berhasil di-reset untuk semua pengguna.',
        });
      } else {
        res.status(404).json({
          statusCode: 404,
          error: true,
          message: 'Tidak ada data yang ditemukan untuk di-reset.',
        });
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mereset kalori harian:', error);
      res.status(500).json({
        statusCode: 500,
        error: true,
        message: 'Internal Server Error',
      });
    }
  };