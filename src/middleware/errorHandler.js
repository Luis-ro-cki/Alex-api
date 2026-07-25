const logger = require('../utils/logger');

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'El cuerpo de la solicitud es demasiado grande.' });
  }
  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.publicMessage || 'Error interno del servidor.'
  });
}

module.exports = { notFound, errorHandler };
