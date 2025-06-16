const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ NEU: GET-Anfrage auf /whisper (z. B. für cron-job.org)
app.get("/whisper", (req, res) => {
  res.status(200).send("✅ Whisper-Proxy ist aktiv (GET erlaubt)");
});

// POST-Anfrage für Whisper (Spracherkennung)
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
    // Datei nach Upload löschen
    fs.unlink(req.file.path, () => {});
  }
});

app.listen(3000, () => {
  console.log("✅ Whisper-Proxy läuft auf Port 3000");
});
