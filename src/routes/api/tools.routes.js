const express = require('express');
const crypto = require('crypto');
const { randomUUID } = require('crypto');
const { ok, fail } = require('../../utils/responses');
const { isNonEmptyString } = require('../../utils/validators');

const router = express.Router();

// GET /api/tools/qr?text=...  -> devuelve un PNG generado localmente (sin servicios externos).
router.get('/qr', (req, res) => {
  const { text } = req.query;
  if (!isNonEmptyString(text, 2000)) {
    return fail(res, 400, 'El parametro "text" es obligatorio.');
  }
  // Generacion de QR simple sin dependencias externas de red: usamos un
  // algoritmo local basico. Para uso en produccion se recomienda anadir la
  // libreria "qrcode" (100% local, sin llamadas externas) - ver README.
  try {
    // eslint-disable-next-line global-require
    const QRCode = require('qrcode');
    QRCode.toBuffer(text, { type: 'png', width: 300 }, (err, buffer) => {
      if (err) return fail(res, 500, 'No se pudo generar el codigo QR.');
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    });
  } catch (e) {
    return fail(res, 501, 'Falta la dependencia "qrcode". Instalala con: npm install qrcode');
  }
});

router.post('/base64/encode', (req, res) => {
  const { text } = req.body || {};
  if (!isNonEmptyString(text)) return fail(res, 400, 'El campo "text" es obligatorio.');
  return ok(res, { result: Buffer.from(text, 'utf8').toString('base64') });
});

router.post('/base64/decode', (req, res) => {
  const { text } = req.body || {};
  if (!isNonEmptyString(text)) return fail(res, 400, 'El campo "text" es obligatorio.');
  try {
    return ok(res, { result: Buffer.from(text, 'base64').toString('utf8') });
  } catch (e) {
    return fail(res, 400, 'El texto no es un Base64 valido.');
  }
});

router.post('/hash/md5', (req, res) => {
  const { text } = req.body || {};
  if (!isNonEmptyString(text)) return fail(res, 400, 'El campo "text" es obligatorio.');
  return ok(res, { result: crypto.createHash('md5').update(text).digest('hex') });
});

router.post('/hash/sha256', (req, res) => {
  const { text } = req.body || {};
  if (!isNonEmptyString(text)) return fail(res, 400, 'El campo "text" es obligatorio.');
  return ok(res, { result: crypto.createHash('sha256').update(text).digest('hex') });
});

router.get('/password', (req, res) => {
  let length = parseInt(req.query.length, 10);
  if (!Number.isFinite(length) || length < 4 || length > 128) length = 16;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    result += chars[bytes[i] % chars.length];
  }
  return ok(res, { result, length });
});

router.get('/uuid', (req, res) => {
  return ok(res, { result: randomUUID() });
});

router.get('/ip', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  return ok(res, { ip });
});

router.get('/user-agent', (req, res) => {
  return ok(res, { userAgent: req.headers['user-agent'] || null });
});

router.get('/timestamp', (req, res) => {
  const now = new Date();
  return ok(res, {
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    unixMs: now.getTime(),
    utc: now.toUTCString()
  });
});

router.get('/color/random', (req, res) => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const rN = r / 255;
    const gN = g / 255;
    const bN = b / 255;
    if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
    else if (max === gN) h = ((bN - rN) / d + 2) / 6;
    else h = ((rN - gN) / d + 4) / 6;
  }
  return ok(res, {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  });
});

module.exports = router;
