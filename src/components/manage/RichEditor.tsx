'use client'

import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Node, mergeAttributes } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

import { cn } from '@/lib/cn'

import { Icon, type AnyIcon } from './Icon'
import { MediaPicker } from './MediaPicker'

const MediaImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), mediaId: { default: null } }
  },
})

/** Embedded video / social post (stored as an "embed" block). */
const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  addAttributes() {
    return { url: { default: '' }, caption: { default: '' } }
  },
  parseHTML() {
    return [{ tag: 'div[data-embed]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ 'data-embed': HTMLAttributes.url, class: 'gm-embed' }),
      `▶ ${HTMLAttributes.url}`,
    ]
  },
})

export function RichEditor({
  value,
  onChange,
  onMedia,
}: {
  value: any
  onChange: (doc: any) => void
  onMedia: (m: { id: number; url: string; alt?: string }) => void
}) {
  const [picker, setPicker] = useState(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true },
      }),
      MediaImage,
      Embed,
      Placeholder.configure({ placeholder: 'Écrivez ici…' }),
    ],
    content: value,
    editorProps: { attributes: { class: 'prose-gacha min-h-72 px-6 py-5 outline-none' } },
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
  })
  if (!editor) return <div className="h-72 animate-pulse rounded-2xl bg-sand" />

  const tb = ({
    icon,
    label,
    on,
    run,
    text,
  }: {
    icon?: AnyIcon
    label: string
    on?: boolean
    run: () => void
    text?: string
  }) => (
    <button
      key={label}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      onClick={run}
      className={cn(
        'grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm transition-colors',
        on ? 'bg-ink text-canvas' : 'text-ink/75 hover:bg-sand',
      )}
    >
      {icon ? <Icon name={icon} className="size-[1.05rem]" /> : text}
    </button>
  )
  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Adresse du lien (laisser vide pour retirer)', prev ?? 'https://')
    if (url === null) return
    if (!url) editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  const addEmbed = () => {
    const url = window.prompt('Adresse de la vidéo (YouTube, Facebook…)')
    if (url) editor.chain().focus().insertContent({ type: 'embed', attrs: { url } }).run()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper focus-within:border-accent">
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-paper/95 p-2 backdrop-blur">
        {tb({
          text: 'H2',
          label: 'Titre',
          on: editor.isActive('heading', { level: 2 }),
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        })}
        {tb({
          text: 'H3',
          label: 'Sous-titre',
          on: editor.isActive('heading', { level: 3 }),
          run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        })}
        <span className="mx-1 h-5 w-px bg-line" />
        {tb({
          icon: 'bold',
          label: 'Gras',
          on: editor.isActive('bold'),
          run: () => editor.chain().focus().toggleBold().run(),
        })}
        {tb({
          icon: 'italic',
          label: 'Italique',
          on: editor.isActive('italic'),
          run: () => editor.chain().focus().toggleItalic().run(),
        })}
        {tb({ icon: 'link', label: 'Lien', on: editor.isActive('link'), run: addLink })}
        <span className="mx-1 h-5 w-px bg-line" />
        {tb({
          icon: 'list',
          label: 'Liste à puces',
          on: editor.isActive('bulletList'),
          run: () => editor.chain().focus().toggleBulletList().run(),
        })}
        {tb({
          icon: 'olist',
          label: 'Liste numérotée',
          on: editor.isActive('orderedList'),
          run: () => editor.chain().focus().toggleOrderedList().run(),
        })}
        {tb({
          icon: 'quote',
          label: 'Citation',
          on: editor.isActive('blockquote'),
          run: () => editor.chain().focus().toggleBlockquote().run(),
        })}
        <span className="mx-1 h-5 w-px bg-line" />
        {tb({ icon: 'media', label: 'Insérer une photo', run: () => setPicker(true) })}
        {tb({ icon: 'video', label: 'Insérer une vidéo', run: addEmbed })}
      </div>
      <EditorContent editor={editor} />
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onPick={(m) => {
            onMedia(m)
            editor
              .chain()
              .focus()
              .setImage({ src: m.url, alt: m.alt, ...({ mediaId: m.id } as object) })
              .run()
            setPicker(false)
          }}
        />
      )}
    </div>
  )
}
