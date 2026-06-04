// src/components/shared/Avatar.jsx
import React from 'react';

/**
 * Avatar  — circular gradient avatar with initials
 *
 * Props:
 *   initials  {string}  – e.g. "SR"
 *   gradient  {string}  – CSS gradient string
 *   size      {"sm"|"md"|"lg"}  – controls width/height via CSS class
 *   status    {"online"|"away"|"offline"|null}  – shows status dot when set
 *   dotSize   {"sm"|"md"}  – size of the status dot (default "sm")
 *   style     {object}   – extra inline styles
 *   className {string}
 */
export function Avatar({ initials, gradient, size = 'md', status, dotSize = 'sm', style, className = '' }) {
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ background: gradient, ...style }}
      aria-label={initials}
    >
      {initials}
      {status && <span className={`status-dot ${dotSize} ${status}`} />}
    </div>
  );
}

/**
 * TeamIcon — square-rounded icon for teams
 *
 * Props same as Avatar minus status/dot.
 */
export function TeamIcon({ initials, gradient, size = 'md', style, className = '' }) {
  return (
    <div
      className={`team-icon team-icon-${size} ${className}`}
      style={{ background: gradient, ...style }}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}
