const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/gpt", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: req.body.model,
      messages: req.body.messages,
      temperature: req.body.temperature || 0.7
    });
    res.json(completion);
  } catch (error) {
    console.error("GPT-Fehler:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("✅ GPT-Proxy läuft auf Port 3000");
});
