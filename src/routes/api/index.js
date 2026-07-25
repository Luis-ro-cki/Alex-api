const express = require('express');
const { requireApiKey } = require('../../middleware/apiKey');

const router = express.Router();

// Todas las rutas publicas de la API requieren una API Key valida.
router.use(requireApiKey);

/**
 * Para agregar una nueva categoria de endpoints:
 *   1. Crea src/routes/api/<categoria>.routes.js
 *   2. Importala y montala aqui con router.use('/<categoria>', ...)
 *   3. Describe sus endpoints en src/config/endpoints.js para que
 *      aparezcan automaticamente en la documentacion.
 */
router.use('/ai', require('./ai.routes'));
router.use('/tools', require('./tools.routes'));
router.use('/text', require('./text.routes'));
router.use('/images', require('./images.routes'));
router.use('/system', require('./system.routes'));
router.use('/download', require('./download.routes'));

module.exports = router;
