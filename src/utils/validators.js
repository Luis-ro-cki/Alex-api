const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function isValidPassword(password) {
  // Minimo 8 caracteres, al menos una letra y un numero.
  return typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

function isNonEmptyString(value, maxLength = 5000) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

module.exports = { isValidEmail, isValidPassword, isNonEmptyString, isValidHttpUrl };
