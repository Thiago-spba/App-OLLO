import React, { useState } from 'react';

const SafeImage = ({ src, alt, placeholder, ...props }) => {
  const [error, setError] = useState(false);

  if (error && placeholder) {
    return <img src={placeholder} alt="placeholder" {...props} />;
  }

  return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
};

export default SafeImage;
