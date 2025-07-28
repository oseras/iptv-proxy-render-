// ✅ MSX uyumlu sade M3U endpoint + full.m3u (70.000+ kanal için)

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const LINK_M3U8 = `http://cavuldur.live:8080/get.php?username=t1hHTYVP&password=P98JrWCN&type=m3u_plus&output=m3u8`;
const LINK_MPEGTS = `http://cavuldur.live:8080/get.php?username=t1hHTYVP&password=P98JrWCN&type=m3u_plus&output=mpegts`;
const GITHUB_LINK = "https://raw.githubusercontent.com/oseras/moj/main/mojlist";

// ✅ Ortak sadeleştirici
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

// 🎯 MSX için sadeleştirilmiş m3u8 versiyonu (az kanal)
app.get('/msx.m3u', async (req, res) => {
  try {
    const [orjRes, gitRes] = await Promise.all([
      fetch(`${LINK_M3U8}&_=${Date.now()}`),
      fetch(GITHUB_LINK)
    ]);

    const [orjText, gitText] = await Promise.all([
      orjRes.text(),
      gitRes.text()
    ]);

    const sadeOrj = sadeM3U(orjText);
    const sadeGit = sadeM3U(gitText);

    const finalList = `#EXTM3U\n${sadeOrj}\n# GITHUB EKSIK\n${sadeGit}`;
    res.set('Content-Type', 'audio/x-mpegurl');
    res.send(finalList);
  } catch (e) {
    res.status(500).send(`#EXTM3U\n# HATA: ${e.message}`);
  }
});

// 🧠 Full liste - output=mpegts (70.000+ kanal)
app.get('/full.m3u', async (req, res) => {
  try {
    const [orjRes, gitRes] = await Promise.all([
      fetch(`${LINK_MPEGTS}&_=${Date.now()}`),
      fetch(GITHUB_LINK)
    ]);

    const [orjText, gitText] = await Promise.all([
      orjRes.text(),
      gitRes.text() // ✅ düzeltildi
    ]);

    const sadeOrj = sadeM3U(orjText);
    const sadeGit = sadeM3U(gitText);

    const finalList = `#EXTM3U\n${sadeOrj}\n# GITHUB EKSIK\n${sadeGit}`;
    res.set('Content-Type', 'audio/x-mpegurl');
    res.send(finalList);
  } catch (e) {
    res.status(500).send(`#EXTM3U\n# HATA: ${e.message}`);
  }
});

// 🔗 Ana sayfa
app.get('/', (req, res) => {
  res.send(`
    <h2>🎉 IPTV Proxy Servisi Aktif</h2>
    <ul>
      <li><a href="/list.m3u" target="_blank">Orijinal + GitHub M3U Listesi</a></li>
      <li><a href="/msx.m3u" target="_blank">MSX Uyumlu (Az Kanal)</a></li>
      <li><a href="/full.m3u" target="_blank">Tüm Kanallar (70.000+)</a></li>
    </ul>
    <p>Geliştirici: oseras</p>
  `);
});

app.listen(PORT, () => console.log(`MSX uyumlu proxy aktif: http://localhost:${PORT}`));
