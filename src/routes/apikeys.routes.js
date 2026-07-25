const express = require('express');
const apiKeyController = require('../controllers/apiKeyController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', apiKeyController.listKeys);
router.post('/', apiKeyController.createKey);
router.post('/:id/regenerate', apiKeyController.regenerateKey);
router.delete('/:id', apiKeyController.deleteKey);
router.get('/:id/usage', apiKeyController.keyUsage);

module.exports = router;
