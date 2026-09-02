/**
 * A small set of geometric line icons.
 *
 * Deliberately plain: even weight, square ends, no character or scene. They
 * label a capability, they don't illustrate one.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true as const,
};

export function IconFacade({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 21V6l8-3 8 3v15" />
      <path d="M4 21h16" />
      <path d="M8 10h3M13 10h3M8 14h3M13 14h3" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}

export function IconWarehouse({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 21V9l9-4 9 4v12" />
      <path d="M3 21h18" />
      <path d="M8 21v-7h8v7" />
      <path d="M8 17h8" />
    </svg>
  );
}

export function IconTank({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 4h12v7H6z" />
      <path d="M6 11l6 4 6-4" />
      <path d="M8 15l-2 6M16 15l2 6M11 16v5M13 16v5" />
      <path d="M6 8h12" />
    </svg>
  );
}

export function IconSteel({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 8h20M2 16h20" />
      <path d="M2 16l5-8 5 8 5-8 5 8" />
    </svg>
  );
}

export function IconInterior({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 3h18v18H3z" />
      <path d="M15 3v18" />
      <path d="M11 12h1" />
      <path d="M3 8h12" />
    </svg>
  );
}

export function IconShield({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l8 3v6c0 4.5-3.2 8.4-8 9.5C7.2 20.4 4 16.5 4 12V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </svg>
  );
}

export function IconBadge({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l2.4 1.8 3-.1.9 2.9 2.4 1.7-1 2.8 1 2.8-2.4 1.7-.9 2.9-3-.1L12 21l-2.4-1.6-3 .1-.9-2.9L3.3 15l1-2.8-1-2.8 2.4-1.7.9-2.9 3 .1z" />
      <path d="M9.5 12l1.8 1.8 3.4-3.6" />
    </svg>
  );
}

export function IconDocument({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconClock({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconCheck({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} strokeWidth={2.5} className={className}>
      <path d="M4.5 12.5l5 5L20 7" />
    </svg>
  );
}
