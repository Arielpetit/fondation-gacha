import Image from 'next/image'

/** Split-screen login: this brand panel fills the left half, Payload's form sits on the right (see custom.scss). */
export function LoginPanel() {
  return (
    <>
      <aside className="gacha-login-panel">
        <Image src="/images/sg/site-aerial.webp" alt="" fill priority sizes="50vw" className="gacha-login-panel__bg" />
        <div className="gacha-login-panel__shade" />
        <div className="gacha-login-panel__body">
          <span className="gacha-login-panel__logo" role="img" aria-label="Fondation Jean-Félicien Gacha" />
          <div>
            <p className="gacha-login-panel__eyebrow">Espace équipe</p>
            <h1>Faites vivre le site de la Fondation.</h1>
            <ul>
              <li>Actualités, pages et actions en quelques clics</li>
              <li>Photos, équipe, partenaires et chambres de la Villa</li>
              <li>Messages reçus et abonnés à la lettre d’information</li>
            </ul>
          </div>
          <p className="gacha-login-panel__foot">© Fondation Jean-Félicien Gacha · Bangoulap, Cameroun</p>
        </div>
      </aside>
      <div className="gacha-welcome">
        <h2>Connexion</h2>
        <p>Accédez à l’espace de gestion du site.</p>
      </div>
    </>
  )
}
