import React, { useState, useEffect } from 'react';
import { getDownloadUrl } from '../services/api';

export default function SecureImage({ fichierId, alt = "Image", className = "", style = {} }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fichierId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getDownloadUrl(fichierId)
      .then(response => {
        if (!isMounted) return;
        // The backend uses the 'uploadUrl' field for both upload and download presigned URLs
        if (response && response.uploadUrl) {
          setImageUrl(response.uploadUrl);
        } else {
          setError("Invalid response from server");
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error("Failed to load secure image URL", err);
        setError("Failed to load image");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fichierId]);

  if (loading) {
    return (
      <div 
        className={`image-placeholder loading ${className}`} 
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#666', minHeight: '50px', minWidth: '50px' }}
      >
        <span style={{ fontSize: '0.8rem' }}>Loading...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div 
        className={`image-placeholder error ${className}`} 
        style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffeaea', color: '#d32f2f', minHeight: '50px', minWidth: '50px', border: '1px solid #ffa3a3' }}
        title={error}
      >
        <span style={{ fontSize: '0.8rem' }}>Image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
    />
  );
}
