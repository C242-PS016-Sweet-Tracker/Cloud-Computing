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
