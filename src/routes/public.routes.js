const express = require('express');
const { ok } = require('../utils/responses');

const router = express.Router();

router.get('/status', (req, res) => {
  return ok(res, { status: 'operativo', timestamp: new Date().toISOString() });
});

module.exports = router;
