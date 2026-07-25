const express = require('express');
const sharp = require('sharp');
const upload = require('../../middleware/upload');
const { fail } = require('../../utils/responses');

const router = express.Router();

function requireImage(req, res) {
  if (!req.file) {
    fail(res, 400, 'Envia una imagen en el campo "image" (multipart/form-data).');
    return null;
  }
  return req.file.buffer;
}

router.post('/resize', upload.single('image'), async (req, res, next) => {
  const buffer = requireImage(req, res);
  if (!buffer) return;
  try {
    const width = Math.min(parseInt(req.query.width, 10) || 300, 4000);
    const height = Math.min(parseInt(req.query.height, 10) || 300, 4000);
    const output = await sharp(buffer).resize(width, height, { fit: 'inside' }).toBuffer();
    res.set('Content-Type', 'image/png');
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/compress', upload.single('image'), async (req, res, next) => {
  const buffer = requireImage(req, res);
  if (!buffer) return;
  try {
    let quality = parseInt(req.query.quality, 10);
    if (!Number.isFinite(quality) || quality < 1 || quality > 100) quality = 70;
    const output = await sharp(buffer).jpeg({ quality }).toBuffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/grayscale', upload.single('image'), async (req, res, next) => {
  const buffer = requireImage(req, res);
  if (!buffer) return;
  try {
    const output = await sharp(buffer).grayscale().toBuffer();
    res.set('Content-Type', 'image/png');
    res.send(output);
  } catch (err) {
    next(err);
  }
});

router.post('/blur', upload.single('image'), async (req, res, next) => {
  const buffer = requireImage(req, res);
  if (!buffer) return;
  try {
    let sigma = parseFloat(req.query.sigma);
    if (!Number.isFinite(sigma) || sigma < 0.3 || sigma > 100) sigma = 5;
    const output = await sharp(buffer).blur(sigma).toBuffer();
    res.set('Content-Type', 'image/png');
    res.send(output);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
