/** Login-screen logo: the Ndop emblem with the Foundation's name. */
export function Logo() {
  return (
    <div className="gacha-logo">
      <svg viewBox="0 0 40 40" width="64" height="64" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="20" cy="20" r="18.5" strokeWidth="1.2" />
        <circle cx="20" cy="20" r="12" strokeWidth="0.9" strokeDasharray="1.5 3" />
        <path d="M20 20 11 11M20 20l9-9M20 20l-9 9M20 20l9 9M20 20H8M20 20h12" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="20" cy="20" r="3.5" fill="currentColor" stroke="none" />
      </svg>
      <p className="gacha-logo__eyebrow">Fondation</p>
      <p className="gacha-logo__name">Jean-Félicien Gacha</p>
    </div>
  )
}
