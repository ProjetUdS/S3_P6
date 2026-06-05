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
 * Checks multiple field sources: API user fields and Keycloak token fields.
 */
export function initialsFromUser(user) {
  if (!user) return '?';

  // API user fields
  if (user?.pseudo && user.pseudo.length >= 2) {
    return user.pseudo.substring(0, 2).toUpperCase();
  }

  // Keycloak token fields
  if (user?.preferred_username && user.preferred_username.length >= 2) {
    return user.preferred_username.substring(0, 2).toUpperCase();
  }

  // Name initials from API fields
  const apiParts = [];
  if (user?.prenom) apiParts.push(user.prenom.charAt(0));
  if (user?.nom) apiParts.push(user.nom.charAt(0));
  if (apiParts.length > 0) return apiParts.join('').toUpperCase();

  // Name initials from Keycloak fields
  const kcParts = [];
  if (user?.given_name) kcParts.push(user.given_name.charAt(0));
  if (user?.family_name) kcParts.push(user.family_name.charAt(0));
  if (kcParts.length > 0) return kcParts.join('').toUpperCase();

  // Fallback to nickname
  if (user?.nickname && user.nickname.length >= 2) {
    return user.nickname.substring(0, 2).toUpperCase();
  }

  return '?';
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
