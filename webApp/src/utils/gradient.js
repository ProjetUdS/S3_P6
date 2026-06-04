// src/utils/gradient.js

/**
 * Deterministic gradient assignment based on CIP.
 * Same CIP always returns the same gradient.
 */

const GRADIENTS = [
  'linear-gradient(135deg, #7c6af7, #a78bfa)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc9eb)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
  'linear-gradient(135deg, #fddb92, #d1fdff)',
];

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function gradientForCip(cip) {
  if (!cip) return GRADIENTS[0];
  const index = hashString(cip) % GRADIENTS.length;
  return GRADIENTS[index];
}

/**
 * Generate initials from a user record.
 * Prefers pseudo, falls back to prenom + nom initials.
 */
export function initialsFromUser(user) {
  if (user?.pseudo && user.pseudo.length >= 2) {
    return user.pseudo.substring(0, 2).toUpperCase();
  }
  const parts = [];
  if (user?.prenom) parts.push(user.prenom.charAt(0));
  if (user?.nom) parts.push(user.nom.charAt(0));
  return parts.length > 0 ? parts.join('').toUpperCase() : '?';
}

/**
 * Get full name from a user record.
 */
export function fullNameFromUser(user) {
  if (!user) return 'Unknown';
  const firstName = user.prenom || '';
  const lastName = user.nom || '';
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return user.pseudo || 'Unknown';
}
