// src/components/shared/Avatar.jsx
import React, { useState, useEffect } from 'react';

/**
 * Avatar  — circular gradient avatar with initials or profile image
 *
 * Props:
 *   initials  {string}  – e.g. "SR" (required, used as fallback)
 *   gradient  {string}  – CSS gradient string (required, used as fallback background)
 *   size      {"sm"|"md"|"lg"}  – controls width/height via CSS class
 *   status    {"online"|"away"|"offline"|null}  – shows status dot when set
 *   dotSize   {"sm"|"md"}  – size of the status dot (default "sm")
 *   style     {object}   – extra inline styles
 *   className {string}
 *   src       {string}   – optional profile image URL
 *   alt       {string}   – optional alt text for profile image
 */
export function Avatar({ initials, gradient, size = 'md', status, dotSize = 'sm', style, className = '', src, alt }) {
  const [showImage, setShowImage] = useState(!!src);

  useEffect(() => {
    setShowImage(!!src);
  }, [src]);

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ background: gradient, ...style }}
      aria-label={alt || initials}
    >
      {showImage && src && (
        <img
          src={src}
          alt={alt || initials}
          className="avatar-image"
          onError={() => setShowImage(false)}
        />
      )}
      {!showImage && initials}
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