// ✅ MSX uyumlu sade M3U endpoint

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// MSX uyumlu versiyon - output=m3u8
const ORJINAL_LINK = `http://cavuldur.live:8080/get.php?username=t1hHTYVP&password=P98JrWCN&type=m3u_plus&output=m3u8`;
const GITHUB_LINK = "https://raw.githubusercontent.com/oseras/moj/main/mojlist";

// M3U çıktısı sadeleştirilmiş, MSX ile uyumlu olacak
app.get('/msx.m3u', async (req, res) => {
  try {
    const [orjRes, gitRes] = await Promise.all([
      fetch(`${ORJINAL_LINK}&_=${Date.now()}`),
      fetch(GITHUB_LINK)
    ]);

    const [orjText, gitText] = await Promise.all([
      orjRes.text(),
      gitRes.text()
    ]);

    // EXTINF satırlarını temizleyelim
    function sadeM3U(m3uText) {
      const lines = m3uText.split('#EXTINF:').slice(1);
      const entries = lines.map(block => {
        const nameMatch = block.match(/,(.*)/);
        const urlMatch = block.match(/(http.*)/);
        if (nameMatch && urlMatch) {
          return `#EXTINF:-1,${nameMatch[1].trim()}\n${urlMatch[1].trim()}`;
        }
        return null;
      }).filter(Boolean);
      return entries.join('\n');
    }

    const sadeOrj = sadeM3U(orjText);
    const sadeGit = sadeM3U(gitText);

    const finalList = `#EXTM3U\n${sadeOrj}\n# GITHUB EKSIK\n${sadeGit}`;

    res.set('Content-Type', 'audio/x-mpegurl');
    res.send(finalList);
  } catch (e) {
    res.status(500).send(`#EXTM3U\n# HATA: ${e.message}`);
  }
});

// 🔧 DÜZGÜN ŞEKİLDE / ROUTE EKLENDİ
app.get('/', (req, res) => {
  res.send(`
    <h2>🎉 IPTV Proxy Servisi Aktif</h2>
    <ul>
      <li><a href="/list.m3u" target="_blank">Orijinal + GitHub M3U Listesi</a></li>
      <li><a href="/msx.m3u" target="_blank">MSX Uyumlu M3U Listesi</a></li>
    </ul>
    <p>Geliştirici: oseras</p>
  `);
});

app.listen(PORT, () => console.log(`MSX uyumlu proxy aktif: http://localhost:${PORT}/msx.m3u`));
