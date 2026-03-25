// ============================================================
//  ShopBot IA — Serveur proxy Node.js (Google Gemini)
//  La clé API Google reste ICI, jamais exposée au client.
// ============================================================
require('dotenv').config();
const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Route proxy vers Google Gemini ─────────────────────────
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Clé API manquante. Ajoutez GEMINI_API_KEY dans vos variables d\'environnement.'
    });
  }

  try {
    const { messages, system } = req.body;

    // Convertir l'historique au format Gemini
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system }]
        },
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
    return res.json({ reply });

  } catch (err) {
    console.error('Erreur API Gemini :', err.message);
    return res.status(500).json({ error: 'Erreur de connexion à l\'API Google Gemini.' });
  }
});

// ── Toutes les autres routes → index.html ───────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ ShopBot IA (Gemini) actif sur http://localhost:${PORT}`);
});
