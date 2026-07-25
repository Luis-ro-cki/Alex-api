/**
 * Registro central de endpoints de Alex API.
 *
 * Esta lista es la UNICA fuente de verdad para:
 *   - La documentacion automatica (/docs).
 *   - El boton "Probar endpoint" de la documentacion.
 *   - Los ejemplos de uso (curl / fetch) que se generan solos.
 *
 * Para agregar un endpoint nuevo:
 *   1. Crea el controlador en src/routes/api/<categoria>.routes.js
 *   2. Agrega UNA entrada aqui describiendola.
 *   3. Listo. La documentacion y los ejemplos se generan automaticamente.
 */

const CATEGORIES = [
  {
    id: 'ia',
    label: 'IA',
    icon: 'brain-circuit',
    description: 'Endpoints de inteligencia artificial. Requieren una clave de proveedor configurada en el servidor.',
    endpoints: [
      { method: 'POST', path: '/api/ai/chat', summary: 'Conversacion con un modelo de lenguaje.', body: { message: 'Hola, ¿que puedes hacer?' } },
      { method: 'POST', path: '/api/ai/translate', summary: 'Traduce un texto a otro idioma.', body: { text: 'Hello world', target: 'es' } },
      { method: 'POST', path: '/api/ai/summarize', summary: 'Genera un resumen breve de un texto largo.', body: { text: 'Texto largo a resumir...' } },
      { method: 'POST', path: '/api/ai/rewrite', summary: 'Reescribe un texto con otro tono o estilo.', body: { text: 'Texto original', style: 'formal' } }
    ]
  },
  {
    id: 'herramientas',
    label: 'Herramientas',
    icon: 'wrench',
    description: 'Utilidades de uso general para cualquier aplicacion.',
    endpoints: [
      { method: 'GET', path: '/api/tools/qr', summary: 'Genera un codigo QR en PNG.', query: { text: 'https://alexapi.dev' } },
      { method: 'POST', path: '/api/tools/base64/encode', summary: 'Codifica un texto en Base64.', body: { text: 'Hola mundo' } },
      { method: 'POST', path: '/api/tools/base64/decode', summary: 'Decodifica un texto Base64.', body: { text: 'SG9sYSBtdW5kbw==' } },
      { method: 'POST', path: '/api/tools/hash/md5', summary: 'Genera un hash MD5.', body: { text: 'Hola mundo' } },
      { method: 'POST', path: '/api/tools/hash/sha256', summary: 'Genera un hash SHA-256.', body: { text: 'Hola mundo' } },
      { method: 'GET', path: '/api/tools/password', summary: 'Genera una contraseña segura aleatoria.', query: { length: '16' } },
      { method: 'GET', path: '/api/tools/uuid', summary: 'Genera un identificador UUID v4.' },
      { method: 'GET', path: '/api/tools/ip', summary: 'Devuelve la IP publica del cliente.' },
      { method: 'GET', path: '/api/tools/user-agent', summary: 'Devuelve el User-Agent del cliente.' },
      { method: 'GET', path: '/api/tools/timestamp', summary: 'Devuelve la fecha y hora actual en varios formatos.' },
      { method: 'GET', path: '/api/tools/color/random', summary: 'Devuelve un color aleatorio en HEX, RGB y HSL.' }
    ]
  },
  {
    id: 'texto',
    label: 'Texto',
    icon: 'type',
    description: 'Transformaciones simples y rapidas de texto.',
    endpoints: [
      { method: 'POST', path: '/api/text/uppercase', summary: 'Convierte un texto a mayusculas.', body: { text: 'hola mundo' } },
      { method: 'POST', path: '/api/text/lowercase', summary: 'Convierte un texto a minusculas.', body: { text: 'HOLA MUNDO' } },
      { method: 'POST', path: '/api/text/reverse', summary: 'Invierte el orden de los caracteres.', body: { text: 'hola mundo' } },
      { method: 'POST', path: '/api/text/count', summary: 'Cuenta caracteres, palabras y lineas.', body: { text: 'hola mundo' } }
    ]
  },
  {
    id: 'imagenes',
    label: 'Imágenes',
    icon: 'image',
    description: 'Procesamiento de imagenes enviadas como archivo (multipart/form-data, campo "image").',
    endpoints: [
      { method: 'POST', path: '/api/images/resize', summary: 'Redimensiona una imagen.', form: true, query: { width: '300', height: '300' } },
      { method: 'POST', path: '/api/images/compress', summary: 'Comprime una imagen manteniendo calidad razonable.', form: true, query: { quality: '70' } },
      { method: 'POST', path: '/api/images/grayscale', summary: 'Convierte una imagen a escala de grises.', form: true },
      { method: 'POST', path: '/api/images/blur', summary: 'Aplica desenfoque gaussiano a una imagen.', form: true, query: { sigma: '5' } }
    ]
  },
  {
    id: 'descargas',
    label: 'Descargas',
    icon: 'download',
    description: 'Extrae metadata y enlaces directos de video/audio a partir de una URL pública (YouTube, TikTok, Instagram, Facebook, X y más, vía yt-dlp). Úsalo solo con contenido propio o con permiso del titular de los derechos.',
    endpoints: [
      { method: 'POST', path: '/api/download/info', summary: 'Devuelve título, miniatura, duración y todos los formatos disponibles.', body: { url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX' } },
      { method: 'GET', path: '/api/download/video', summary: 'Devuelve el enlace directo de descarga del mejor formato de video.', query: { url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX' } },
      { method: 'GET', path: '/api/download/audio', summary: 'Devuelve el enlace directo de descarga del mejor formato de solo audio.', query: { url: 'https://www.youtube.com/watch?v=XXXXXXXXXXX' } }
    ]
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: 'server-cog',
    description: 'Informacion sobre el estado de la plataforma.',
    endpoints: [
      { method: 'GET', path: '/api/system/status', summary: 'Estado actual de la API.' },
      { method: 'GET', path: '/api/system/stats', summary: 'Estadisticas globales de la plataforma.' },
      { method: 'GET', path: '/api/system/version', summary: 'Version actual del servicio.' },
      { method: 'GET', path: '/api/system/uptime', summary: 'Tiempo que lleva activo el servidor.' }
    ]
  }
];

function allEndpointsFlat() {
  return CATEGORIES.flatMap((cat) =>
    cat.endpoints.map((ep) => ({ ...ep, category: cat.id, categoryLabel: cat.label }))
  );
}

module.exports = { CATEGORIES, allEndpointsFlat };
