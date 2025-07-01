// src/components/pages/profile/ProfilePrivacyField.jsx
import EyeIcon from './eyeIcon';

export default function ProfilePrivacyField({
  label,
  value,
  visible,
  onToggle,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-gray-700 dark:text-gray-300 font-medium">
        {label}:
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        {visible ? value : 'Oculto'}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={visible ? 'Ocultar campo' : 'Mostrar campo'}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}
