import React from 'react';

const SafeImage = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    onError={(e) => {
      e.target.onerror = null;
      e.target.style.display = 'none'; // ou coloque um src de placeholder
    }}
    {...props}
  />
);

export default SafeImage;
