import express from 'express';
import axios from 'axios';
import { config } from 'dotenv';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const apiUrls = config().parsed;

app.all('/*', async (req, res, next) => {
    const { method, path, originalUrl, body } = req;

    console.log('req', method, originalUrl, body);

    const targetApiName = path.split('/')[1];
    const targetApiBaseUrl = apiUrls[targetApiName];

    if (targetApiBaseUrl) {
        const targetApiUrl = `${targetApiBaseUrl}${originalUrl}`
        try {
            const headers = {...req.headers};
            delete headers.host;
            const axiosConfig = {
                method: method,
                url: targetApiUrl,
                headers: headers,
                ...((Object.keys(body) || {}).length > 0 && {data: body}),
            };

            const targetResponse = await axios(axiosConfig);
            res.set(targetResponse.headers);
            res.send(targetResponse.data);
            console.log('==>', targetApiUrl, '==> status:', targetResponse.status);

        } catch (error) {
            if (error.response) {
                const {status, data} = error.response;
                res.set(error.response.headers);
                res.status(status).json(data);
                console.log('==>', targetApiUrl, '==> status:', status);
            } else {
                res.status(500).json({error: error.message});
                console.log('==>', targetApiUrl, 'failed');
            }
        }
    } else {
        res.status(502).json({ error: 'Cannot process request' });
        console.log('==> no target to redirect');
    }

    next();
});

app.listen(PORT, () =>
    console.log(`BFF service is running on http://localhost:${PORT}`)
);
