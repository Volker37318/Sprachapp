const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


// ✅ 1. GET für GPT-Cronjob
app.get("/gpt", (req, res) => {
  res.status(200).send("✅ GPT-Proxy ist aktiv (GET erlaubt)");
});

// ✅ 2. POST für GPT-Antworten
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


// ✅ 3. GET für Whisper-Cronjob
app.get("/whisper", (req, res) => {
  res.status(200).send("✅ Whisper-Proxy ist aktiv (GET erlaubt)");
});

// ✅ 4. POST für Whisper-Transkription
app.post("/whisper", upload.single("file"), async (req, res) => {
  try {
    const file = fs.createReadStream(req.file.path);
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: req.body.language || "de"
    });

    res.json({ text: transcription.text });
  } catch (error) {
    console.error("Whisper-Fehler:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlink(req.file.path, () => {}); // Datei aufräumen
  }
});


// ✅ 5. Serverstart
app.listen(3000, () => {
  console.log("✅ GPT- und Whisper-Proxy laufen auf Port 3000");
});
