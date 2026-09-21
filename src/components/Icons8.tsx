import React, { useState } from 'react';

interface Icons8Props {
  name: string;
  size?: number;
  color?: string; // hex color without # (e.g. "10b981", "ffffff", "ef4444")
  style?: 'ios-filled' | 'material-sharp' | 'fluency';
  className?: string;
  fallbackIcon?: React.ReactNode;
  title?: string;
}

export const Icons8: React.FC<Icons8Props> = ({
  name,
  size = 20,
  color = 'ffffff',
  style = 'ios-filled',
  className = '',
  fallbackIcon,
  title,
}) => {
  const [hasError, setHasError] = useState(false);
  
  // Clean color hex string
  const cleanColor = color.replace('#', '');
  
  // Icons8 CDN OMG-IMG URL
  const src = `https://img.icons8.com/${style}/${size * 2}/${cleanColor}/${name}.png`;

  if (hasError && fallbackIcon) {
    return <span className={`inline-flex items-center justify-center shrink-0 ${className}`} title={title}>{fallbackIcon}</span>;
  }

  return (
    <img
      src={src}
      alt={title || name}
      title={title || name}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`inline-block shrink-0 object-contain select-none pointer-events-none transition-transform ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      loading="lazy"
    />
  );
};
