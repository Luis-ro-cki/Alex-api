const { execFile } = require('child_process');

const YTDLP_BIN = process.env.YTDLP_PATH || 'yt-dlp';
const TIMEOUT_MS = 25000;

function isConfigured() {
  return new Promise((resolve) => {
    execFile(YTDLP_BIN, ['--version'], { timeout: 5000 }, (err) => resolve(!err));
  });
}

/**
 * Pide a yt-dlp la metadata del video (sin descargarlo al servidor) en JSON.
 * yt-dlp detecta automaticamente la plataforma a partir de la URL:
 * YouTube, TikTok, Instagram, Facebook, Twitter/X, y muchas mas.
 */
function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    execFile(
      YTDLP_BIN,
      ['-j', '--no-playlist', '--no-warnings', url],
      { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 * 20 },
      (err, stdout, stderr) => {
        if (err) {
          const message = stderr && stderr.trim() ? stderr.trim().split('\n').pop() : err.message;
          return reject(new Error(message || 'No se pudo procesar el enlace.'));
        }
        try {
          const data = JSON.parse(stdout);
          resolve(data);
        } catch (parseErr) {
          reject(new Error('La respuesta del extractor no se pudo interpretar.'));
        }
      }
    );
  });
}

function summarize(raw) {
  const formats = Array.isArray(raw.formats) ? raw.formats : [];

  const videoFormats = formats
    .filter((f) => f.vcodec && f.vcodec !== 'none' && f.url)
    .map((f) => ({
      formatId: f.format_id,
      ext: f.ext,
      quality: f.format_note || (f.height ? `${f.height}p` : 'desconocida'),
      hasAudio: Boolean(f.acodec && f.acodec !== 'none'),
      filesize: f.filesize || f.filesize_approx || null,
      url: f.url
    }));

  const audioFormats = formats
    .filter((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && f.url)
    .map((f) => ({
      formatId: f.format_id,
      ext: f.ext,
      bitrate: f.abr ? `${Math.round(f.abr)}kbps` : 'desconocido',
      filesize: f.filesize || f.filesize_approx || null,
      url: f.url
    }));

  return {
    source: raw.extractor_key || raw.extractor || 'desconocida',
    title: raw.title || null,
    thumbnail: raw.thumbnail || null,
    durationSeconds: raw.duration || null,
    uploader: raw.uploader || null,
    directUrl: raw.url || (videoFormats[0] && videoFormats[0].url) || null,
    bestVideo: videoFormats.slice(-1)[0] || null,
    bestAudio: audioFormats.slice(-1)[0] || null,
    videoFormats,
    audioFormats
  };
}

async function getInfo(url) {
  const raw = await fetchMetadata(url);
  return summarize(raw);
}

module.exports = { isConfigured, getInfo };
