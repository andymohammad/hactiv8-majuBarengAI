import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Menentukan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mengatur dotenv untuk memuat file .env dari direktori root
dotenv.config({ path: `${__dirname}/../.env` });

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = "gemini-1.5-flash";
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port, () => {
  console.log(`Gemini Chatbot running on http://localhost:${port}`);
  console.log(process.env.GEMINI_API_KEY);
});


// API CHAT
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));
    const resp = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents
    });
    res.json({ result: extractText(resp) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


function extractText(resp) {
  try {
    const text =
    resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
    resp?.response?.candidates?.[0]?.content?.text;
    
    return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
    console.log("Error extracting text:", err);
    return JSON.stringify(resp, null, 2);
  }
}