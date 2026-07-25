/**
 * Adaptador de IA.
 *
 * Los endpoints /api/ai/* NO incluyen ninguna clave ni servicio de terceros
 * "inventado". Este archivo deja la integracion lista para conectarse a un
 * proveedor real (OpenAI, Anthropic, etc.) en cuanto configures las
 * variables de entorno AI_PROVIDER y AI_PROVIDER_API_KEY en tu archivo .env.
 *
 * Mientras esas variables no esten configuradas, isConfigured() devuelve
 * false y las rutas de IA responden 501 explicando como activarlas.
 */

function isConfigured() {
  return Boolean(process.env.AI_PROVIDER && process.env.AI_PROVIDER_API_KEY);
}

/**
 * Punto de integracion real. Ejemplo de como conectarlo cuando tengas
 * credenciales (no se ejecuta ninguna llamada mientras no este configurado):
 *
 *   if (process.env.AI_PROVIDER === 'anthropic') {
 *     const resp = await fetch('https://api.anthropic.com/v1/messages', {
 *       method: 'POST',
 *       headers: {
 *         'content-type': 'application/json',
 *         'x-api-key': process.env.AI_PROVIDER_API_KEY,
 *         'anthropic-version': '2023-06-01'
 *       },
 *       body: JSON.stringify({
 *         model: 'claude-sonnet-4-6',
 *         max_tokens: 1000,
 *         messages: [{ role: 'user', content: prompt }]
 *       })
 *     });
 *     const data = await resp.json();
 *     return data.content.map((b) => b.text || '').join('\n');
 *   }
 */
async function complete(prompt) {
  if (!isConfigured()) {
    const err = new Error('Proveedor de IA no configurado');
    err.notConfigured = true;
    throw err;
  }
  // Integracion real pendiente de anadir aqui una vez configures AI_PROVIDER.
  throw new Error('Integracion de proveedor de IA pendiente de implementar.');
}

module.exports = { isConfigured, complete };
