import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Endpoint de recherche de DPE en direct
 */
app.post('/api/search', async (req, res) => {
  try {
    const { codePostal, dateDepart } = req.body;

    if (!codePostal) {
      return res.status(400).json({ error: 'Le code postal est requis.' });
    }

    const url = 'https://observatoire-dpe-audit.ademe.fr/api/publiques/recherche';
    
    const payload = {
      code_postal: codePostal,
      date_activation_debut: dateDepart || null,
      limite: 100,
      page: 1
    };

    // Nous imitons ici les en-têtes de sécurité requis par l'ADEME pour éviter le 403
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://observatoire-dpe-audit.ademe.fr',
        'Referer': 'https://observatoire-dpe-audit.ademe.fr/donnees-dpe-publiques',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur ADEME : ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Erreur de recherche :', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DPE Scan démarré sur http://localhost:${PORT}`);
});