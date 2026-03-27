require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Config par défaut (chaque client personnalise via variables d'environnement)
const defaultConfig = {
  botName: "Sophie",
  shopName: "Ma Boutique",
  shopDesc: "Boutique en ligne spécialisée dans la vente de produits de qualité.",
  primaryColor: "#6c63ff",
  suggestions: ["Où est ma commande ?", "Politique de retour", "Modes de paiement", "Délais de livraison"]
};

// Route config — chaque boutique a ses propres variables d'environnement
app.get('/config', (req, res) => {
  res.json({
    botName: process.env.BOT_NAME || defaultConfig.botName,
    shopName: process.env.SHOP_NAME || defaultConfig.shopName,
    shopDesc: process.env.SHOP_DESC || defaultConfig.shopDesc,
    primaryColor: process.env.PRIMARY_COLOR || defaultConfig.primaryColor,
    suggestions: process.env.SUGGESTIONS
      ? process.env.SUGGESTIONS.split('|')
      : defaultConfig.suggestions
  });
});

// Route chat principale
app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Clé API manquante.' });
  }

  try {
    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu répondre.';
    return res.json({ reply });

  } catch (err) {
    console.error('Erreur Gemini:', err.message);
    return res.status(500).json({ error: 'Erreur de connexion à l\'API Gemini.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ ShopBot IA (Gemini) actif sur http://localhost:${PORT}`);
});
