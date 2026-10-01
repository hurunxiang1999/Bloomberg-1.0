import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeTickers } from './src/server/analyzeHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for macro-financial news and sentiment analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const tickers = req.body.tickers || [];
    const data = await analyzeTickers(tickers);
    res.json(data);
  } catch (err: any) {
    console.error('[Production Server API Error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Serve static frontend build
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Macro-Financial Sentiment Server] Listening on port ${PORT}`);
});
