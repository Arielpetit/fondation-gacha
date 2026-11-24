import Link from 'next/link'

/** Brand block at the top of the admin sidebar. */
export function NavBrand() {
  return (
    <div className="gacha-navbrand">
      <Link href="/admin" aria-label="Tableau de bord">
        <span className="gacha-navbrand__mark" role="img" aria-label="Fondation Jean-Félicien Gacha" />
        <span className="gacha-navbrand__text">
          <strong>Fondation Gacha</strong>
          <small>Espace équipe</small>
        </span>
      </Link>
      <a className="gacha-navbrand__site" href="/" target="_blank" rel="noopener">
        Voir le site ↗
      </a>
    </div>
  )
}
