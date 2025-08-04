// src/components/pages/profile/EyeIcon.jsx
export default function EyeIcon({ visible = true, className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="img"
      aria-label={visible ? 'Visível' : 'Oculto'}
      {...props}
    >
      <svg
        width="22"
        height="22"
        fill="none"
        stroke="#27C36D"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {visible ? (
          <>
            <ellipse cx="12" cy="12" rx="9" ry="5" />
            <circle cx="12" cy="12" r="2.5" />
          </>
        ) : (
          <>
            <ellipse cx="12" cy="12" rx="9" ry="5" />
            <circle cx="12" cy="12" r="2.5" />
            <line x1="4" y1="20" x2="20" y2="4" />
          </>
        )}
      </svg>
    </span>
  );
}
