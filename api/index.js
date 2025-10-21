import express from 'express';
import { PrimaryAI, fallbackAIChat } from './ai.js';

const app = express();
app.use(express.json({ limit: '10kb' }));

const PORT = process.env.PORT || 3000;

app.post('/api/chat', async (req, res) => {
    const { query, customModel, language } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ success: false, message: 'Query tidak valid atau kosong.' });
    }

    let fullQuery = query;
    if (customModel) fullQuery = `${customModel}. ${fullQuery}`;
    if (language) fullQuery = `${fullQuery}. Balas dalam bahasa ${language}.`;

    try {
        const primaryApi = new PrimaryAI();
        console.log("Mencoba API Utama...");
        
        const primaryPromise = primaryApi.chat(fullQuery, { model: 'default' });
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API utama timeout.')), 25000)
        );
        
        const result = await Promise.race([primaryPromise, timeoutPromise]);

        res.json({
            success: true,
            author: "aka",
            email: "akaanakbaik17@proton.me",
            source: "primary",
            response: result.text,
            citations: result.citations
        });

    } catch (error) {
        console.warn(`API Utama gagal: ${error.message}. Beralih ke API Cadangan...`);
        try {
            const fallbackResult = await fallbackAIChat(fullQuery);
            res.json({
                success: true,
                author: "aka",
                email: "akaanakbaik17@proton.me",
                source: "fallback",
                response: fallbackResult.text,
                citations: fallbackResult.citations
            });
        } catch (fallbackError) {
            console.error(`API Cadangan juga gagal: ${fallbackError.message}`);
            res.status(500).json({ success: false, message: fallbackError.message || 'Kedua API gagal merespons.' });
        }
    }
});

app.get('/api', (req, res) => {
    res.send('API Server is running.');
});

export default app;                                     
