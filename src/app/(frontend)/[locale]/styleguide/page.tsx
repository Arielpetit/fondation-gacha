import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { Counter, ImageReveal, Magnetic, Marquee, Parallax, Reveal, SplitText, Stagger, StaggerItem } from '@/components/motion'
import { NdopDraw } from '@/components/ndop/NdopDraw'
import { NdopBand, NdopPattern, type NdopMotif } from '@/components/ndop/NdopPattern'
import { ArrowLink, Button } from '@/components/ui/Button'
import { ActivityCard, EventCard, NewsCard, Quote, RoomCard, TierCard } from '@/components/ui/cards'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { Container, Eyebrow, Section, SectionHeading } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

const colors = [
  { name: 'Indigo Ndop', token: 'indigo-ndop', hex: '#1E2A55', cls: 'bg-indigo-ndop text-ivory' },
  { name: 'Indigo deep', token: 'indigo-deep', hex: '#121933', cls: 'bg-indigo-deep text-ivory' },
  { name: 'Ivory', token: 'ivory', hex: '#F7F3EC', cls: 'bg-ivory text-ink ring-1 ring-line ring-inset' },
  { name: 'Sand', token: 'sand', hex: '#EDE4D3', cls: 'bg-sand text-ink' },
  { name: 'Raffia', token: 'raffia', hex: '#D9C7A3', cls: 'bg-raffia text-ink' },
  { name: 'Terracotta', token: 'terracotta', hex: '#B4532A', cls: 'bg-terracotta text-ivory' },
  { name: 'Forest', token: 'forest', hex: '#2F4A3A', cls: 'bg-forest text-ivory' },
  { name: 'Ink', token: 'ink', hex: '#1B1B1F', cls: 'bg-ink text-ivory' },
]

const motifs: NdopMotif[] = ['dots', 'zigzag', 'diamonds', 'checker', 'moon', 'spider', 'ladder']

const activities = [
  { href: '/actions/education', title: 'Soutien à l’éducation', summary: 'Écoles de Maka et de Manoré, soutien scolaire, alphabétisation et « L’éducation pour tous ».', image: { src: '/images/sg/school-donation.webp', alt: 'Remise de fournitures scolaires devant le Centre JLD' } },
  { href: '/actions/artisanat', title: 'Ateliers d’artisanat', summary: 'Perlage, couture, ferronnerie, menuiserie : transmettre les savoir-faire du Cameroun.', image: { src: '/images/sg/atelier-perlage.webp', alt: 'Atelier de perlage' } },
  { href: '/actions/residences', title: 'Résidences d’artistes', summary: 'Écrivains, peintres et designers en résidence à la Villa Boutanga depuis 2013.', image: { src: '/images/sg/residence-barbara.webp', alt: 'Barbara Asei Dantoni devant une œuvre' } },
]

export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="pt-[var(--header-h)]">
      {/* Intro */}
      <Section tone="paper" spacing="md">
        <Container>
          <Eyebrow>Phase 1 · Design system</Eyebrow>
          <SplitText
            as="h1"
            animateOnMount
            text="Fondation Gacha — système de design"
            className="mt-6 max-w-4xl font-display text-display-lg font-light"
          />
          <p className="mt-6 max-w-2xl text-lead text-muted">
            Couleurs, typographie, motifs Ndop, composants et animations. Page interne, non indexée.
          </p>
        </Container>
      </Section>

      {/* Colours */}
      <Section spacing="md">
        <Container>
          <SectionHeading eyebrow="Couleurs" title="Indigo Ndop & terres de l’Ouest" size="sm" />
          <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colors.map((c) => (
              <StaggerItem key={c.token} className={`flex aspect-[4/3] flex-col justify-end rounded-sm p-4 ${c.cls}`}>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs opacity-70">
                  {c.token} · {c.hex}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* Typography */}
      <Section tone="sand" spacing="md">
        <Container className="space-y-8">
          <SectionHeading eyebrow="Typographie" title="Fraunces & Inter" size="sm" />
          <div className="space-y-6 border-t border-line pt-8">
            <p className="font-display text-display-xl font-light">Bangoulap</p>
            <p className="font-display text-display-lg font-light">Savoir faire, faire savoir</p>
            <p className="font-display text-display-md font-light">pour savoir être</p>
            <p className="font-display text-display-sm italic">Il faut aider les autres, écouter les autres.</p>
            <p className="max-w-2xl text-lead">
              La Fondation Jean-Félicien Gacha œuvre au Cameroun pour favoriser l’éveil des vocations, développer les
              talents et diffuser la connaissance.
            </p>
            <p className="max-w-2xl leading-relaxed text-muted">
              Corps de texte — Inter. Nous œuvrons dans cinq grands domaines : l’instruction et la formation, la culture
              et l’artisanat, la santé et l’action sociale, l’environnement et l’agriculture, le tourisme solidaire.
            </p>
          </div>
        </Container>
      </Section>

      {/* Buttons */}
      <Section spacing="md">
        <Container>
          <SectionHeading eyebrow="Actions" title="Boutons & liens" size="sm" />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="/soutenir/don" arrow>
              Faire un don
            </Button>
            <Button href="/fondation" variant="secondary" arrow>
              Découvrir
            </Button>
            <Button href="/contact" variant="outline">
              Nous contacter
            </Button>
            <Button href="https://maisongacha.fr" external variant="outline" arrow>
              maisongacha.fr
            </Button>
            <Magnetic>
              <Button variant="primary" size="lg" arrow>
                Bouton magnétique
              </Button>
            </Magnetic>
            <ArrowLink href="/actualites">Lire la suite</ArrowLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Tag>Culture</Tag>
            <Tag tone="indigo">Éducation</Tag>
            <Tag tone="terracotta">Agenda</Tag>
            <Tag tone="forest">Environnement</Tag>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-sm bg-indigo-ndop p-6">
            <Button variant="light" arrow>
              Sur fond sombre
            </Button>
            <Button variant="outline-light">Secondaire</Button>
          </div>
        </Container>
      </Section>

      {/* Ndop */}
      <Section tone="indigo" spacing="md">
        <Container>
          <SectionHeading
            dark
            eyebrow="Motifs"
            title="Le Ndop, redessiné"
            intro="Étoffe des cours royales et sociétés secrètes du Grassfields. Motifs vectoriels, colorés par la couleur du texte."
            size="sm"
          />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {motifs.map((m) => (
              <div key={m}>
                <div className="aspect-square rounded-sm border border-ivory/15 text-ivory/80">
                  <NdopPattern motif={m} scale={0.8} />
                </div>
                <p className="mt-2 text-xs text-ivory/60">{m}</p>
              </div>
            ))}
          </div>
          <NdopBand className="mt-12 text-raffia" />
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <NdopDraw className="mx-auto size-64 text-raffia" />
            <p className="text-lead text-ivory/75">
              <span className="text-ivory">NdopDraw</span> — l’emblème lune & araignée (Ngaame, symbole de sagesse) se
              trace au défilement. Utilisé en transition de section et dans le pied de page.
            </p>
          </div>
        </Container>
      </Section>

      {/* Motion */}
      <Section spacing="lg">
        <Container>
          <SectionHeading eyebrow="Animation" title="Mouvements" size="sm" />
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
            <ImageReveal
              src="/images/sg/ndop-textile.webp"
              alt="Étoffes Ndop indigo et blanches"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/5] rounded-sm"
            />
            <div className="space-y-10">
              <SplitText
                text="Révélation mot à mot au défilement"
                className="font-display text-display-md font-light"
              />
              <Reveal>
                <p className="text-lead text-muted">
                  ImageReveal : rideau clip-path + léger zoom, puis parallaxe. Reveal / Stagger : fondu et montée.
                  Toutes les animations sont désactivées si l’utilisateur préfère réduire les mouvements.
                </p>
              </Reveal>
              <div className="grid grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <Counter value={26} locale={locale} className="font-display text-display-md" />
                  <p className="mt-1 text-sm text-muted">chambres & suites</p>
                </div>
                <div>
                  <Counter value={9} locale={locale} className="font-display text-display-md" />
                  <p className="mt-1 text-sm text-muted">filières agréées</p>
                </div>
                <div>
                  <Counter value={1500} suffix=" m" locale={locale} className="font-display text-display-md" />
                  <p className="mt-1 text-sm text-muted">d’altitude</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-24 grid gap-6 sm:grid-cols-3">
            <Parallax speed={0.4}>
              <ImageReveal src="/images/sg/jacaranda-restaurant.webp" alt="Restaurant Le Jacaranda" sizes="33vw" className="aspect-[3/4] rounded-sm" parallax={0} />
            </Parallax>
            <Parallax speed={-0.2} className="sm:mt-24">
              <ImageReveal src="/images/sg/residence-alice.webp" alt="Alice Ifergan Rey en résidence" sizes="33vw" className="aspect-[3/4] rounded-sm" parallax={0} delay={0.1} />
            </Parallax>
            <Parallax speed={0.6}>
              <ImageReveal src="/images/sg/villa-terrace.webp" alt="Terrasse de la Villa Boutanga" sizes="33vw" className="aspect-[3/4] rounded-sm" parallax={0} delay={0.2} />
            </Parallax>
          </div>
        </Container>

        <div className="mt-24 border-y border-line py-8">
          <Marquee duration={50}>
            {['MINEFOP', 'AGIR abcd', 'Institut français du Cameroun', 'Route des Chefferies', 'Université des Montagnes', 'ICOM', 'Fondation Dexeus Mujer', 'Amis du Chœur Madrigal'].map((p) => (
              <span key={p} className="flex items-center gap-10 px-5 font-display text-3xl font-light whitespace-nowrap text-ink/70">
                {p}
                <span className="size-2 rounded-full bg-terracotta" aria-hidden />
              </span>
            ))}
          </Marquee>
        </div>
      </Section>

      {/* Cards */}
      <Section tone="paper" spacing="lg">
        <Container>
          <SectionHeading
            eyebrow="Composants"
            title="Nos actions"
            intro="ActivityCard : image pleine hauteur, résumé dévoilé au survol."
            size="sm"
            action={<ArrowLink href="/actions">Toutes nos actions</ArrowLink>}
          />
          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a, i) => (
              <StaggerItem key={a.href}>
                <ActivityCard {...a} index={i + 1} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-24 grid gap-12 lg:grid-cols-12">
            <NewsCard
              className="lg:col-span-7"
              featured
              locale={locale}
              href="/actualites/bangoulap-au-coeur-du-livre-1ere-edition-a-la-fondation-jean-felicien-gacha"
              title="Bangoulap au cœur du livre — 1ère édition"
              excerpt="Du 13 au 20 janvier 2025, auteurs, artistes et passionnés se réunissent pour célébrer la richesse des littératures africaines."
              date="2025-01-14"
              category="Littérature"
              image={{ src: '/images/sg/residence-alice.webp', alt: 'Résidence de création' }}
            />
            <div className="flex flex-col gap-12 lg:col-span-5">
              <NewsCard
                locale={locale}
                href="/actualites/creation-de-la-maison-gacha"
                title="Création de la Maison Gacha !"
                date="2024-08-23"
                category="Institution"
                image={{ src: '/images/sg/ndop-textile.webp', alt: 'Textiles Ndop' }}
              />
            </div>
          </div>

          <div className="mt-24">
            <SectionHeading eyebrow="Agenda" title="À venir" size="sm" />
            <div className="mt-8 border-b border-line">
              <EventCard locale={locale} href="/actualites/x" title="Vacances Utiles — ateliers pour les enfants et les jeunes" start="2026-07-06" end="2026-08-28" place="Centre des Cultures JLD" category="Jeunesse" />
              <EventCard locale={locale} href="/actualites/y" title="Ciné Jeunesse : projection et discussion" start="2026-12-12" place="Auditorium" category="Cinéma" />
              <EventCard locale={locale} href="/actualites/z" title="Assemblée générale de la Fondation" start="2027-02-20" place="Bangoulap" category="Institution" />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="ivory" spacing="lg">
        <Container>
          <SectionHeading eyebrow="Villa Boutanga" title="Chambres & suites" size="sm" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <RoomCard locale={locale} perNight="par nuit · tarif 2024" guestsLabel="pers." name="Chambre double" description="2 lits simples, sanitaires et douches sur le palier." capacity={2} price={26000} image={{ src: '/images/sg/villa-terrace.webp', alt: 'Chambre double' }} />
            <RoomCard locale={locale} perNight="par nuit · tarif 2024" guestsLabel="pers." name="Suite Fenga" description="Un lit double, TV, salle de bain privative." capacity={2} price={44000} image={{ src: '/images/sg/jacaranda-restaurant.webp', alt: 'Suite Fenga' }} />
            <RoomCard locale={locale} perNight="par nuit · tarif 2024" guestsLabel="pers." name="Suite sénior familiale" description="1 lit double, 2 lits simples, salle de bain privative, TV." capacity={4} price={58000} image={{ src: '/images/sg/site-aerial.webp', alt: 'Villa Boutanga' }} />
          </div>
        </Container>
      </Section>

      <Section tone="sand" spacing="lg">
        <Container>
          <SectionHeading eyebrow="Adhésion" title="Devenir membre" align="center" size="sm" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <TierCard locale={locale} name="Jeunes" price={2000} note="élèves et étudiants · 5 000 FCFA non-élèves" perks={['Accès libre à la bibliothèque et au cinéma', 'Activités ponctuelles sur le site']} cta={<Button href="/soutenir/adhesion" variant="outline" className="w-full">Adhérer</Button>} />
            <TierCard highlighted locale={locale} name="Actif" price={25000} perks={['Accès libre à la bibliothèque, au cinéma et aux débats', 'Réductions sur les visites guidées', 'Participation à l’Assemblée générale']} cta={<Button href="/soutenir/adhesion" variant="light" className="w-full" arrow>Adhérer</Button>} />
            <TierCard locale={locale} name="Bienfaiteur" price={100000} perks={['Tous les avantages membre actif', 'Invitation aux manifestations de la Fondation', 'Soutien direct aux projets du Centre JLD']} cta={<Button href="/soutenir/adhesion" variant="outline" className="w-full">Adhérer</Button>} />
          </div>
        </Container>
      </Section>

      <Section tone="forest" spacing="lg">
        <Container className="grid gap-16 lg:grid-cols-2">
          <Quote dark author="Ly Dumas" role="Fondatrice et présidente">
            Dans chacune de nos actions, nous nous engageons pour le partage des savoirs, en encourageant les savoir-faire et
            les faire-savoir, pour savoir être.
          </Quote>
          <div className="flex flex-col justify-end">
            <p className="mb-4 text-ivory/75">NewsletterForm</p>
            <NewsletterForm dark label="E-mail" placeholder="Votre adresse e-mail" submit="S’inscrire" success="Merci !" />
          </div>
        </Container>
      </Section>
    </div>
  )
}
