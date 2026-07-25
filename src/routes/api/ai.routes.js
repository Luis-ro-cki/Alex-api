const express = require('express');
const { ok, fail } = require('../../utils/responses');
const { isNonEmptyString } = require('../../utils/validators');
const aiService = require('../../services/aiService');

const router = express.Router();

function notConfiguredResponse(res) {
  return fail(
    res,
    501,
    'Este endpoint de IA aun no esta configurado en el servidor. Define AI_PROVIDER y AI_PROVIDER_API_KEY en el archivo .env para activarlo.'
  );
}

router.post('/chat', async (req, res) => {
  const { message } = req.body || {};
  if (!isNonEmptyString(message, 8000)) return fail(res, 400, 'El campo "message" es obligatorio.');
  if (!aiService.isConfigured()) return notConfiguredResponse(res);
  try {
    const result = await aiService.complete(message);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 502, 'El proveedor de IA no pudo procesar la solicitud.');
  }
});

router.post('/translate', async (req, res) => {
  const { text, target } = req.body || {};
  if (!isNonEmptyString(text, 8000)) return fail(res, 400, 'El campo "text" es obligatorio.');
  if (!isNonEmptyString(target, 10)) return fail(res, 400, 'El campo "target" (idioma destino) es obligatorio.');
  if (!aiService.isConfigured()) return notConfiguredResponse(res);
  try {
    const result = await aiService.complete(`Traduce a ${target}: ${text}`);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 502, 'El proveedor de IA no pudo procesar la solicitud.');
  }
});

router.post('/summarize', async (req, res) => {
  const { text } = req.body || {};
  if (!isNonEmptyString(text, 20000)) return fail(res, 400, 'El campo "text" es obligatorio.');
  if (!aiService.isConfigured()) return notConfiguredResponse(res);
  try {
    const result = await aiService.complete(`Resume: ${text}`);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 502, 'El proveedor de IA no pudo procesar la solicitud.');
  }
});

router.post('/rewrite', async (req, res) => {
  const { text, style } = req.body || {};
  if (!isNonEmptyString(text, 20000)) return fail(res, 400, 'El campo "text" es obligatorio.');
  if (!aiService.isConfigured()) return notConfiguredResponse(res);
  try {
    const result = await aiService.complete(`Reescribe con estilo ${style || 'neutral'}: ${text}`);
    return ok(res, { result });
  } catch (err) {
    return fail(res, 502, 'El proveedor de IA no pudo procesar la solicitud.');
  }
});

module.exports = router;
