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
            SELECT users.username, detail_user.kalori FROM detail_user 
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