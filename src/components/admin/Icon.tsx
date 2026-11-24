/** Small emblem shown at the top of the admin sidebar. */
export function Icon() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden>
      <rect width="40" height="40" rx="9" fill="#1e2a55" />
      <g fill="none" stroke="#f7f3ec" strokeLinecap="round">
        <circle cx="20" cy="20" r="14" strokeWidth="1.6" />
        <path d="M20 20 12.5 12.5M20 20l7.5-7.5M20 20l-7.5 7.5M20 20l7.5 7.5M20 20H10M20 20h10" strokeWidth="1.8" />
      </g>
      <circle cx="20" cy="20" r="3.5" fill="#d9c7a3" />
    </svg>
  )
}
