const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const ORJINAL_LINK = `http://cavuldur.live:8080/get.php?username=t1hHTYVP&password=P98JrWCN&type=m3u_plus&output=mpegts`;
const GITHUB_LINK = "https://raw.githubusercontent.com/oseras/moj/main/mojlist";

app.get('/list.m3u', async (req, res) => {
  try {
    const [orjRes, gitRes] = await Promise.all([
      fetch(`${ORJINAL_LINK}&_=${Date.now()}`),
      fetch(GITHUB_LINK)
    ]);

    if (!orjRes.ok || !gitRes.ok) throw new Error("Liste alınamadı");

    const [orjText, gitText] = await Promise.all([
      orjRes.text(),
      gitRes.text()
    ]);

    const orjNames = new Set();
    orjText.split('#EXTINF:').forEach(line => {
      const match = line.match(/tvg-name="([^"]+)"/);
      if (match) orjNames.add(match[1]);
    });

    const eksikler = gitText.split('#EXTINF:')
      .filter(line => {
        const match = line.match(/tvg-name="([^"]+)"/);
        return match && !orjNames.has(match[1]);
      })
      .map(line => '#EXTINF:' + line.trim())
      .join('\n');

    const finalList = `#EXTM3U\n${orjText.trim()}\n\n# GITHUB EKSİKLER\n${eksikler.trim()}`;
    res.set('Content-Type', 'audio/x-mpegurl');
    res.send(finalList);
  } catch (e) {
    res.status(206).send(`#EXTM3U\n# Yalnızca orijinal liste\n${e.message}`);
  }
});

app.get('/', (req, res) => {
  res.send(`<h2>✅ IPTV Proxy</h2><a href="/list.m3u">M3U listesine git</a>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
