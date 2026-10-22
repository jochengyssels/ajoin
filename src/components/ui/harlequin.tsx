/**
 * A strip of harlequin diamonds, taken from the jester cap on the logo.
 * Used as a seam between the carnival hero and the calmer page below.
 */
export function Harlequin({ className = "" }: { className?: string }) {
  return (
    <svg className={`block h-4 w-full ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        <pattern id="harlequin" width="32" height="16" patternUnits="userSpaceOnUse">
          <rect width="32" height="16" fill="var(--color-onion-dark)" />
          <path d="M0 8 8 0 16 8 8 16Z" fill="var(--color-skin)" />
          <path d="M16 8 24 0 32 8 24 16Z" fill="var(--color-onion)" />
          <circle cx="8" cy="8" r="1.4" fill="var(--color-paper)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#harlequin)" />
    </svg>
  );
}
