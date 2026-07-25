const express = require('express');
const { ok, fail } = require('../../utils/responses');
const { isValidHttpUrl } = require('../../utils/validators');
const downloaderService = require('../../services/downloaderService');

const router = express.Router();

function notConfiguredResponse(res) {
  return fail(
    res,
    501,
    'Este endpoint necesita que el servidor tenga "yt-dlp" instalado. Revisa el Dockerfile / README para activarlo.'
  );
}

function extractUrl(req) {
  return (req.body && req.body.url) || req.query.url;
}

router.post('/info', async (req, res) => {
  const url = extractUrl(req);
  if (!isValidHttpUrl(url)) return fail(res, 400, 'Envía una "url" válida (http/https).');
  if (!(await downloaderService.isConfigured())) return notConfiguredResponse(res);

  try {
    const info = await downloaderService.getInfo(url);
    return ok(res, { result: info });
  } catch (err) {
    return fail(res, 422, err.message || 'No se pudo procesar ese enlace.');
  }
});

router.get('/video', async (req, res) => {
  const url = extractUrl(req);
  if (!isValidHttpUrl(url)) return fail(res, 400, 'Envía "url" como parámetro de consulta.');
  if (!(await downloaderService.isConfigured())) return notConfiguredResponse(res);

  try {
    const info = await downloaderService.getInfo(url);
    const link = (info.bestVideo && info.bestVideo.url) || info.directUrl;
    if (!link) return fail(res, 422, 'No se encontró un formato de video descargable para ese enlace.');
    return ok(res, {
      result: { title: info.title, thumbnail: info.thumbnail, source: info.source, url: link }
    });
  } catch (err) {
    return fail(res, 422, err.message || 'No se pudo procesar ese enlace.');
  }
});

router.get('/audio', async (req, res) => {
  const url = extractUrl(req);
  if (!isValidHttpUrl(url)) return fail(res, 400, 'Envía "url" como parámetro de consulta.');
  if (!(await downloaderService.isConfigured())) return notConfiguredResponse(res);

  try {
    const info = await downloaderService.getInfo(url);
    const link = (info.bestAudio && info.bestAudio.url) || null;
    if (!link) return fail(res, 422, 'No se encontró un formato de solo audio para ese enlace.');
    return ok(res, {
      result: { title: info.title, source: info.source, url: link }
    });
  } catch (err) {
    return fail(res, 422, err.message || 'No se pudo procesar ese enlace.');
  }
});

module.exports = router;
