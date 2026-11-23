/**
 * Creates or updates the site's forms (idempotent, matched by slug).
 *   pnpm seed:forms
 * Editors can then change labels, recipients and messages in Admin → Formulaires.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { textToLexical } from './wp/html'

type L = { fr: string; en: string }
type FieldDef =
  | { blockType: 'text' | 'email' | 'textarea' | 'number' | 'date' | 'checkbox'; name: string; label: L; required?: boolean; width?: number }
  | { blockType: 'select'; name: string; label: L; required?: boolean; width?: number; options: { value: string; label: L }[] }

type FormDef = {
  slug: string
  title: L
  submit: L
  confirmation: L
  to: string
  subject: string
  fields: FieldDef[]
}

const name: FieldDef = { blockType: 'text', name: 'nom', label: { fr: 'Nom et prénom', en: 'Full name' }, required: true, width: 50 }
const email: FieldDef = { blockType: 'email', name: 'email', label: { fr: 'E-mail', en: 'Email' }, required: true, width: 50 }
const phone: FieldDef = { blockType: 'text', name: 'telephone', label: { fr: 'Téléphone (WhatsApp)', en: 'Phone (WhatsApp)' }, width: 50 }
const message = (required = false): FieldDef => ({ blockType: 'textarea', name: 'message', label: { fr: 'Message', en: 'Message' }, required, width: 100 })

const FORMS: FormDef[] = [
  {
    slug: 'contact',
    title: { fr: 'Contact', en: 'Contact' },
    submit: { fr: 'Envoyer le message', en: 'Send message' },
    confirmation: { fr: 'Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.', en: 'Thank you! Your message has been sent. We will get back to you soon.' },
    to: 'contact@fondationgacha.org',
    subject: 'Nouveau message depuis le site — {{sujet}}',
    fields: [
      name,
      email,
      phone,
      {
        blockType: 'select',
        name: 'sujet',
        label: { fr: 'Sujet', en: 'Subject' },
        required: true,
        width: 50,
        options: [
          { value: 'information', label: { fr: 'Demande d’information', en: 'General enquiry' } },
          { value: 'visite', label: { fr: 'Visite guidée', en: 'Guided tour' } },
          { value: 'partenariat', label: { fr: 'Partenariat', en: 'Partnership' } },
          { value: 'presse', label: { fr: 'Presse', en: 'Press' } },
          { value: 'autre', label: { fr: 'Autre', en: 'Other' } },
        ],
      },
      message(true),
    ],
  },
  {
    slug: 'reservation-villa',
    title: { fr: 'Demande de réservation — Villa Boutanga', en: 'Booking request — Villa Boutanga' },
    submit: { fr: 'Envoyer ma demande', en: 'Send my request' },
    confirmation: {
      fr: 'Merci ! Votre demande de réservation a bien été reçue. La Villa Boutanga vous confirmera la disponibilité par e-mail ou WhatsApp.',
      en: 'Thank you! Your booking request has been received. Villa Boutanga will confirm availability by email or WhatsApp.',
    },
    to: 'villa@fondationgacha.org',
    subject: 'Demande de réservation — {{nom}} ({{arrivee}} → {{depart}})',
    fields: [
      name,
      email,
      { ...phone, required: true } as FieldDef,
      { blockType: 'number', name: 'personnes', label: { fr: 'Nombre de personnes', en: 'Number of guests' }, required: true, width: 50 },
      { blockType: 'date', name: 'arrivee', label: { fr: 'Arrivée', en: 'Arrival' }, required: true, width: 50 },
      { blockType: 'date', name: 'depart', label: { fr: 'Départ', en: 'Departure' }, required: true, width: 50 },
      {
        blockType: 'select',
        name: 'chambre',
        label: { fr: 'Chambre souhaitée', en: 'Preferred room' },
        width: 100,
        options: [
          { value: 'indifferent', label: { fr: 'Peu importe', en: 'No preference' } },
          { value: 'chambre-double', label: { fr: 'Chambre double', en: 'Twin room' } },
          { value: 'chambre-simple', label: { fr: 'Chambre simple', en: 'Double room' } },
          { value: 'suite-fenga', label: { fr: 'Suite Fenga', en: 'Fenga suite' } },
          { value: 'suite-junior', label: { fr: 'Suite junior', en: 'Junior suite' } },
          { value: 'suite-business', label: { fr: 'Suite sénior « business »', en: 'Senior “business” suite' } },
          { value: 'suite-familiale', label: { fr: 'Suite sénior « familiale »', en: 'Senior “family” suite' } },
          { value: 'suite-parentale', label: { fr: 'Suite parentale', en: 'Parents’ suite' } },
          { value: 'suite-boukarou', label: { fr: 'Suite Boukarou', en: 'Boukarou suite' } },
        ],
      },
      { blockType: 'checkbox', name: 'restaurant', label: { fr: 'Je souhaite dîner au restaurant Le Jacaranda', en: 'I would like to dine at Le Jacaranda' }, width: 100 },
      message(),
    ],
  },
  {
    slug: 'adhesion',
    title: { fr: 'Demande d’adhésion', en: 'Membership request' },
    submit: { fr: 'Devenir membre', en: 'Become a member' },
    confirmation: {
      fr: 'Merci pour votre adhésion ! Le service dons et volontariat vous contactera pour le règlement et l’envoi de votre carte.',
      en: 'Thank you for joining! Our donations team will contact you about payment and your membership card.',
    },
    to: 'elodie.tchouakui@fondationgacha.org',
    subject: 'Nouvelle adhésion — carte {{carte}} — {{nom}}',
    fields: [
      name,
      email,
      phone,
      {
        blockType: 'select',
        name: 'carte',
        label: { fr: 'Carte de membre', en: 'Membership card' },
        required: true,
        width: 50,
        options: [
          { value: 'jeunes', label: { fr: 'Jeunes — 2 000 / 5 000 FCFA', en: 'Youth — 2,000 / 5,000 FCFA' } },
          { value: 'actif', label: { fr: 'Actif — 25 000 FCFA', en: 'Active — 25,000 FCFA' } },
          { value: 'bienfaiteur', label: { fr: 'Bienfaiteur — 100 000 FCFA', en: 'Benefactor — 100,000 FCFA' } },
        ],
      },
      message(),
    ],
  },
  {
    slug: 'benevolat',
    title: { fr: 'Proposer mon aide', en: 'Offer my help' },
    submit: { fr: 'Envoyer ma candidature', en: 'Send my application' },
    confirmation: { fr: 'Merci ! Nous étudions votre proposition et revenons vers vous.', en: 'Thank you! We will review your offer and get back to you.' },
    to: 'elodie.tchouakui@fondationgacha.org',
    subject: 'Proposition de bénévolat — {{nom}}',
    fields: [
      name,
      email,
      phone,
      { blockType: 'text', name: 'disponibilites', label: { fr: 'Disponibilités (dates, durée)', en: 'Availability (dates, length)' }, width: 50 },
      { blockType: 'textarea', name: 'competences', label: { fr: 'Vos compétences et votre projet', en: 'Your skills and plans' }, required: true, width: 100 },
    ],
  },
  {
    slug: 'recu-don',
    title: { fr: 'Demande de reçu de don', en: 'Donation receipt request' },
    submit: { fr: 'Demander mon reçu', en: 'Request my receipt' },
    confirmation: { fr: 'Merci pour votre générosité ! Votre reçu vous sera envoyé par e-mail.', en: 'Thank you for your generosity! Your receipt will be sent by email.' },
    to: 'elodie.tchouakui@fondationgacha.org',
    subject: 'Demande de reçu de don — {{nom}} ({{montant}})',
    fields: [
      name,
      email,
      { blockType: 'text', name: 'montant', label: { fr: 'Montant et devise', en: 'Amount and currency' }, required: true, width: 50 },
      { blockType: 'date', name: 'date_don', label: { fr: 'Date du don', en: 'Date of donation' }, required: true, width: 50 },
      { blockType: 'text', name: 'adresse', label: { fr: 'Adresse postale (pour le reçu)', en: 'Postal address (for the receipt)' }, width: 100 },
      message(),
    ],
  },
]

const blocksFor = (f: FormDef, locale: 'fr' | 'en', ids?: string[]) =>
  f.fields.map((field, i) => ({
    ...(ids?.[i] ? { id: ids[i] } : {}),
    blockType: field.blockType,
    name: field.name,
    label: field.label[locale],
    required: field.required ?? false,
    width: field.width ?? 100,
    ...(field.blockType === 'select'
      ? { options: field.options.map((o) => ({ value: o.value, label: o.label[locale] })) }
      : {}),
  }))

const payload = await getPayload({ config })

for (const f of FORMS) {
  const existing = await payload.find({ collection: 'forms', where: { slug: { equals: f.slug } }, limit: 1, depth: 0 })
  const base = {
    slug: f.slug,
    title: f.title.fr,
    submitButtonLabel: f.submit.fr,
    confirmationType: 'message' as const,
    confirmationMessage: textToLexical([f.confirmation.fr]),
    emails: [
      {
        emailTo: f.to,
        replyTo: '{{email}}',
        subject: f.subject,
        message: textToLexical(['Nouveau message reçu depuis le site de la Fondation :', '{{*:table}}']),
      },
    ],
    fields: blocksFor(f, 'fr'),
  }

  let doc
  try {
    doc = existing.docs[0]
      ? await payload.update({ collection: 'forms', id: existing.docs[0].id, locale: 'fr', data: base as never })
      : await payload.create({ collection: 'forms', locale: 'fr', data: base as never })
  } catch (e) {
    console.error(`✗ ${f.slug}`, JSON.stringify((e as { data?: unknown }).data ?? (e as Error).message))
    throw e
  }

  // English labels on the same blocks (ids must match).
  const ids = (doc.fields ?? []).map((b: { id?: string | null }) => b.id ?? '')
  await payload.update({
    collection: 'forms',
    id: doc.id,
    locale: 'en',
    data: {
      submitButtonLabel: f.submit.en,
      confirmationMessage: textToLexical([f.confirmation.en]),
      fields: blocksFor(f, 'en', ids),
    } as never,
  })
  console.log(`✓ ${f.slug}`)
}

process.exit(0)
