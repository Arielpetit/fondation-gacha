/**
 * Structured content transcribed from the old site's pages (checked Nov 2026).
 * Sources: /fondation/equipe (2020), /activites/residences-decrivain (2023),
 * /participer-soutenir/partenaires (2023), /visiter/villa-boutanga and
 * /visiter/informations-pratiques (Jan 2024 prices), /publications/membre (2022).
 */

export const settings = {
  address: 'Bangoulap, département du Ndé, Ouest-Cameroun (près de Bangangté)',
  hours: 'La Fondation et sa boutique sont ouvertes du lundi au dimanche, de 9h à 17h',
  contacts: [
    { service: 'Villa Boutanga — réservations', phones: '+237 695 85 60 95 / +237 650 07 02 35 / +237 683 66 02 02 / +237 697 82 06 28', email: 'villa@fondationgacha.org' },
    { service: 'Centre des Cultures JLD', person: 'William Kuihane', phones: '+237 670 23 35 95 / +237 656 57 16 05', email: 'contact@fondationgacha.org' },
    { service: 'Service administratif', person: 'Pierre Tchomobe, directeur', phones: '+237 243 10 82 30 / +237 690 70 01 89', email: 'contact@fondationgacha.org' },
    { service: 'Dons et volontariat', person: 'Elodie Tchouakui Ketchiamen', phones: '+237 243 10 82 28 / +237 696 82 11 04', email: 'elodie.tchouakui@fondationgacha.org' },
  ],
  social: {
    facebook: 'https://www.facebook.com/FondationJFG/',
    newsletter: 'https://espaceculturelgacha.us19.list-manage.com/subscribe?u=61936a8183421f73529f56879&id=f059c6ba12',
  },
  visitPrices: [
    { label: 'Visiteur étranger ou expatrié', price: 2000 },
    { label: 'Camerounais résident', price: 1000 },
    { label: 'Élève / étudiant', price: 500 },
    { label: 'Enfant jusqu’à 12 ans révolus', price: 0 },
    { label: 'Résident de la Villa Boutanga', price: 0 },
    { label: 'Groupe (10–15 pers.) — visiteur étranger ou expatrié', price: 1500 },
    { label: 'Groupe (10–15 pers.) — Camerounais résident', price: 750 },
    { label: 'Groupe (10–15 pers.) — élève / étudiant', price: 250 },
  ],
  visitNotes:
    'L’accès au site de la Fondation est libre. La collection d’objets traditionnels se découvre uniquement en visite guidée, avec le médiateur culturel de la Fondation. Sur demande, des parcours culturels ou de marche guidés sont proposés dans toute la région, sur une ou plusieurs journées, transport et restauration possibles.',
  membershipTiers: [
    { name: 'Jeunes', price: 2000, note: 'Élèves et étudiants — 5 000 FCFA pour les non-élèves' },
    { name: 'Actif', price: 25000, highlighted: true },
    { name: 'Bienfaiteur', price: 100000 },
  ],
  membershipPerks: [
    { text: 'Être informé régulièrement des activités de l’ONG Fondation Jean-Félicien Gacha' },
    { text: 'Accès libre à la bibliothèque, au cinéma, aux débats-conférences et aux animations du site' },
    { text: 'Réductions sur les visites guidées et les événements temporaires' },
    { text: 'Participer aux projets du Centre des Cultures JLD et proposer vos idées' },
    { text: 'Assister à l’Assemblée générale de la Fondation' },
  ],
  donationIntro:
    'La Fondation orientera votre don vers l’une de ses actions, selon vos souhaits. Vous recevrez en retour une carte de membre vous permettant d’être convié aux manifestations organisées par la Fondation.',
  bank: { holder: 'Espace culturel Gacha', iban: 'FR76 3000 4025 4900 0102 4828 802', bic: 'BNPAFRPPXXX' },
}

export const team: { name: string; role?: string; group: 'board' | 'staff' | 'volunteer' }[] = [
  { name: 'Ly Dumas', role: 'Fondatrice et présidente', group: 'board' },
  { name: 'Pierre Tchomobe', role: 'Directeur', group: 'staff' },
  { name: 'William Kuihane', role: 'Centre des Cultures JLD', group: 'staff' },
  { name: 'Elodie Tchouakui', role: 'Dons et volontariat', group: 'staff' },
  { name: 'Jules Jacques Mde Moujefou', group: 'staff' },
  { name: 'Laurence Yogoum', group: 'staff' },
  { name: 'Igénie Nomba Gniaye', role: 'Maître en perlage', group: 'staff' },
  { name: 'Gilbert Wembe', role: 'Ferronnerie d’art', group: 'staff' },
  { name: 'Dominique Manga', group: 'staff' },
  { name: 'Benjamin Campaore', group: 'staff' },
  { name: 'Guillaume Yanga', role: 'Peintre', group: 'staff' },
  { name: 'Dieudonné Koudjo Djamen', group: 'staff' },
  { name: 'Raoul Paul Etoko', group: 'volunteer' },
  { name: 'Daryl Etoundi', group: 'volunteer' },
  { name: 'Daniela Ulieriu', group: 'volunteer' },
  { name: 'Rajesh Kumar', group: 'volunteer' },
  { name: 'Elizabeth Ledoux', group: 'volunteer' },
  { name: 'Solène Rolland Huckel', group: 'volunteer' },
]

export const residents: { name: string; year: number; discipline?: string }[] = [
  { name: 'Barbara Asei Dantoni', year: 2023, discipline: 'Arts plastiques' },
  { name: 'Alice Ifergan Rey', year: 2023, discipline: 'Création' },
  { name: 'Pierre Christophe Gam', year: 2021, discipline: 'Design' },
  { name: 'Annick Kamga', year: 2020 },
  { name: 'Julien Blanc-Gras', year: 2017, discipline: 'Écriture' },
  { name: 'Guillaume Jan', year: 2017, discipline: 'Écriture' },
  { name: 'Cajou Matumbo', year: 2016 },
  { name: 'Maud Basan', year: 2015 },
  { name: 'Arno Bertina', year: 2014, discipline: 'Écriture' },
  { name: 'Joël Raffier', year: 2014, discipline: 'Écriture' },
  { name: 'Sami Tchak', year: 2013, discipline: 'Écriture' },
]

type Kind = 'institutional' | 'cultural' | 'academic' | 'association' | 'sponsor'
export const partners: { name: string; kind: Kind; description: string; url?: string }[] = [
  { name: 'MINEFOP', kind: 'institutional', description: 'Ministère de l’Emploi et de la Formation professionnelle du Cameroun : agrément du Centre des Cultures JLD pour ses formations professionnelles.' },
  { name: 'AGIR abcd', kind: 'association', description: 'Association de retraités bénévoles pour la coopération et le développement, présente dans les différents secteurs d’intervention de la Fondation.' },
  { name: 'Institut français du Cameroun', kind: 'cultural', description: 'Partenariat permettant d’accueillir des écrivains en résidence à la Villa Boutanga.' },
  { name: 'La Route des Chefferies', kind: 'cultural', description: 'Programme muséal, culturel et touristique : les voyageurs peuvent faire étape à la Fondation au cours des circuits.' },
  { name: 'Université des Montagnes', kind: 'academic', description: 'Unité de production animale mise à disposition des étudiants vétérinaires, soutien scolaire et projets communs.' },
  { name: 'ICOM', kind: 'cultural', description: 'La Fondation est membre du Conseil international des musées depuis 2024.' },
  { name: 'Musée du quai Branly – Jacques Chirac', kind: 'cultural', description: 'Audioguide de la statue perlée de la reine Bansoa (2011) ; la boutique du musée distribue des créations des ateliers depuis 2017.' },
  { name: 'Fondation Dexeus Mujer', kind: 'sponsor', description: 'Projets communs pour la santé et l’accès à l’eau ; Prix 2023 remis à Ly Dumas.' },
  { name: 'Les Amis du Chœur Madrigal du Cameroun', kind: 'association', description: 'Collecte et sauvegarde des chants traditionnels du Cameroun.' },
  { name: 'Afro-Polis', kind: 'cultural', description: 'Festival des cultures africaines auquel la Fondation a participé à plusieurs éditions.' },
  { name: 'IAM Intense Art Magazine', kind: 'cultural', description: 'Exposition à la galerie MAM de Douala (2015) et numéro consacré aux femmes camerounaises.' },
]

export const rooms: {
  name: string
  description: string
  capacity: number
  price: number
  priceVariants?: { label: string; price: number }[]
}[] = [
  { name: 'Chambre double', description: '2 lits simples, sanitaires et douches sur le palier.', capacity: 2, price: 26000 },
  { name: 'Chambre simple', description: '1 lit double, sanitaires et douches sur le palier.', capacity: 2, price: 26000 },
  { name: 'Suite Fenga', description: 'Un lit double, TV, salle de bain.', capacity: 2, price: 44000 },
  {
    name: 'Suite junior',
    description: '1 lit double et 1 lit simple, salle de bain privative, TV.',
    capacity: 3,
    price: 38000,
    priceVariants: [
      { label: '2 personnes', price: 38000 },
      { label: '3 personnes', price: 46000 },
    ],
  },
  { name: 'Suite sénior « business »', description: '1 lit double, petit salon, bureau, salle de bain privative, TV.', capacity: 2, price: 46000 },
  { name: 'Suite sénior « familiale »', description: '1 lit double, 2 lits simples, salle de bain privative, TV.', capacity: 4, price: 58000 },
  { name: 'Suite parentale', description: '2 chambres séparées, salle de bain et TV côté parents, 1 lit double, 1 lit superposé, 1 lit simple.', capacity: 5, price: 64000 },
  { name: 'Suite Boukarou', description: 'Dans l’aile « ambassadeur » : 1 lit double, salon commun, kitchenette.', capacity: 2, price: 78000 },
]

/** Nicer titles for migrated pages (the old site used ALL CAPS titles). */
export const PAGE_TITLES: Record<string, { title: string; eyebrow?: string; motif?: string; order?: number }> = {
  fondation: { title: 'Présentation', eyebrow: 'La Fondation' },
  'fondation/infrastructures': { title: 'Infrastructures', eyebrow: 'La Fondation' },
  'fondation/equipe': { title: 'Équipe & bénévoles', eyebrow: 'La Fondation' },
  'sejourner/boutique': { title: 'La boutique', eyebrow: 'Séjourner' },
  'sejourner/villa-boutanga': { title: 'Villa Boutanga & restaurant Le Jacaranda', eyebrow: 'Séjourner' },
  'sejourner/visites': { title: 'Visites & informations pratiques', eyebrow: 'Séjourner' },
  'soutenir/don': { title: 'Faire un don', eyebrow: 'Soutenir' },
  'soutenir/partenaires': { title: 'Partenaires', eyebrow: 'Soutenir' },
  'soutenir/adhesion': { title: 'Devenir membre', eyebrow: 'Soutenir' },
  'ressources/presse': { title: 'Presse & vidéos', eyebrow: 'Ressources' },
  'ressources/bilans': { title: 'Bilans d’activités', eyebrow: 'Ressources' },
  'maison-gacha': { title: 'Maison Gacha', eyebrow: 'Paris' },
  // Activities
  education: { title: 'Soutien à l’éducation', motif: 'ladder', order: 1 },
  'formation-professionnelle': { title: 'Formation professionnelle', motif: 'checker', order: 2 },
  artisanat: { title: 'Ateliers d’artisanat', motif: 'diamonds', order: 3 },
  culture: { title: 'Culture & équipements culturels', motif: 'moon', order: 4 },
  residences: { title: 'Résidences d’artistes', motif: 'spider', order: 5 },
  environnement: { title: 'Environnement & agriculture', motif: 'zigzag', order: 6 },
  'sante-social': { title: 'Santé & action sociale', motif: 'dots', order: 7 },
  'tourisme-solidaire': { title: 'Tourisme solidaire', motif: 'zigzag', order: 8 },
}
