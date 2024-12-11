import axios from 'axios';
import FormData from 'form-data';

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
