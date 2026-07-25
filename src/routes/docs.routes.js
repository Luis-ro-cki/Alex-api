const express = require('express');
const { CATEGORIES } = require('../config/endpoints');
const { ok } = require('../utils/responses');

const router = express.Router();

router.get('/', (req, res) => {
  ok(res, { categories: CATEGORIES });
});

module.exports = router;
