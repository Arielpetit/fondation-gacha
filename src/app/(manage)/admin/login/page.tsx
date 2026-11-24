import Image from 'next/image'
import { redirect } from 'next/navigation'

import { getAdmin } from '@/admin/server'
import { LoginForm } from '@/components/manage/LoginForm'
import { FoundationLogo } from '@/components/ui/Logo'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Connexion' }

export default async function LoginPage() {
  const { payload, user } = await getAdmin()
  if (user) redirect('/admin')
  const first = (await payload.count({ collection: 'users', overrideAccess: true })).totalDocs === 0
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-indigo-deep text-ivory lg:block">
        <Image
          src="/images/sg/site-aerial.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-deep/55 to-indigo-deep/90" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <FoundationLogo className="w-36 text-ivory" />
          <div>
            <p className="eyebrow text-[0.65rem] text-raffia">Espace équipe</p>
            <h2 className="mt-4 max-w-md font-display text-[2.8rem] leading-[1.05] font-light tracking-tight text-balance">
              Faites vivre le site de la Fondation.
            </h2>
            <ul className="mt-8 grid gap-3 text-[0.95rem] text-ivory/85">
              {[
                'Actualités, pages et actions en quelques clics',
                'Photos, équipe, partenaires et chambres de la Villa',
                'Messages reçus et abonnés à la lettre d’information',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-raffia" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-ivory/55">
            © Fondation Jean-Félicien Gacha · Bangoulap, Cameroun
          </p>
        </div>
      </section>
      <section className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <FoundationLogo className="mb-8 w-24 text-indigo-ndop lg:hidden dark:text-raffia" />
          <h1 className="font-display text-[2.2rem] font-light tracking-tight">
            {first ? 'Créer le premier compte' : 'Connexion'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {first
              ? 'Ce compte deviendra administrateur du site.'
              : 'Accédez à l’espace de gestion du site.'}
          </p>
          <LoginForm first={first} />
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- leaves the admin for the public site */}
          <a
            href="/"
            className="mt-8 inline-block text-sm text-muted transition-colors hover:text-ink"
          >
            ← Retour au site
          </a>
        </div>
      </section>
    </main>
  )
}
