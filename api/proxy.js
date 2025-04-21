const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const rewriteUrl = (url, base) => {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
};

app.get('/', (req, res) => {
  res.send('Servidor proxy está rodando!');
});

app.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.startsWith('http')) {
    return res.status(400).send('URL inválida.');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Reescrevendo links, imagens, etc.
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        const absoluteHref = rewriteUrl(href, url);
        $(el).attr('href', `/proxy?url=${encodeURIComponent(absoluteHref)}`);
        $(el).attr('target', '_parent');
      }
    });

    res.send($.html());
  } catch (error) {
    console.error('Erro ao acessar:', error.message);
    res.status(500).send(`Erro ao carregar o site: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
