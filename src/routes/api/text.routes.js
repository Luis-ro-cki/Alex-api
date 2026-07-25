const express = require('express');
const { ok, fail } = require('../../utils/responses');
const { isNonEmptyString } = require('../../utils/validators');

const router = express.Router();

function requireText(req, res) {
  const { text } = req.body || {};
  if (!isNonEmptyString(text, 20000)) {
    fail(res, 400, 'El campo "text" es obligatorio.');
    return null;
  }
  return text;
}

router.post('/uppercase', (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;
  return ok(res, { result: text.toUpperCase() });
});

router.post('/lowercase', (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;
  return ok(res, { result: text.toLowerCase() });
});

router.post('/reverse', (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;
  return ok(res, { result: text.split('').reverse().join('') });
});

router.post('/count', (req, res) => {
  const text = requireText(req, res);
  if (text === null) return;
  const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
  const lines = text.split(/\r\n|\r|\n/).length;
  return ok(res, {
    result: {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words,
      lines
    }
  });
});

module.exports = router;
