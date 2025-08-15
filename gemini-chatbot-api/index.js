import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.listen(port, () => {
  console.log(`Gemini Chatbot running on http://localhost:${port}`);
});

// Route penting!
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Something went wrong." });
  }
});


// Last page
appendMessage('user', userMessage);
input.value = '';

// Simulasi dummy balasan bot (placeholder)
setTimeout(() => {
  appendMessage('bot', 'Gemini is thinking... (this is dummy response)');
}, 1000);

// Send message to backend using fetch
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message: userMessage }),
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  appendMessage('bot', data.reply); // Assuming your backend sends back { reply: "..." }
})
.catch(error => {
  console.error('Error sending message:', error);
  appendMessage('bot', 'Error: Could not get a response.'); // Display an error message
});
