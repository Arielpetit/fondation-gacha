import type { ReactNode } from 'react'

import type { IconName } from '@/admin/resources'

const P: Record<string, ReactNode> = {
  home: <><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" /></>,
  news: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  page: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>,
  action: <><circle cx="12" cy="12" r="8" /><path d="m12 8 1.6 3.4L17 12l-3.4 1.6L12 17l-1.6-3.4L7 12l3.4-1.6z" /></>,
  media: <><rect x="3.5" y="5" width="17" height="14" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="m5 17 5-4 3 2.5 3-3 3 3" /></>,
  tag: <><path d="M4 12V5h7l9 9-7 7z" /><circle cx="8.5" cy="8.5" r="1" /></>,
  team: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.2c1.6.6 2.7 2.2 3 4.8" /></>,
  handshake: <><path d="M3 12l4-4 4 2 3-2 4 3 3-1" /><path d="m7 8 5 8 3-2 4 3" /></>,
  bed: <><path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.8" /></>,
  book: <><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 18a2 2 0 0 1 2-2h12" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="m4.5 8 7.5 5.5L19.5 8" /></>,
  inbox: <><path d="M4 13l2-7h12l2 7" /><path d="M4 13v5h16v-5h-5l-1 2h-4l-1-2z" /></>,
  users: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.7-3.7 3.4-5.5 7-5.5s6.3 1.8 7 5.5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h10" /></>,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  palette: <><path d="M12 4a8 8 0 1 0 0 16c1.4 0 1.8-1 1.3-2-.6-1.1.1-2.2 1.4-2.2H17a3 3 0 0 0 3-3C20 7.5 16.4 4 12 4z" /><circle cx="8.5" cy="11" r="1" /><circle cx="12" cy="8" r="1" /><circle cx="15.5" cy="10" r="1" /></>,
  award: <><circle cx="12" cy="9" r="5" /><path d="m9 13.5-1.5 6.5 4.5-2.5 4.5 2.5L15 13.5" /></>,
  file: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" /></>,
  trash: <><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" /></>,
  arrow: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  back: <><path d="M20 12H4M10 6l-6 6 6 6" /></>,
  out: <><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" /></>,
  ext: <><path d="M14 4h6v6M20 4l-9 9M10 6H5v13h13v-5" /></>,
  check: <><path d="m5 12 5 5 9-10" /></>,
  x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  upload: <><path d="M12 16V5M7 10l5-5 5 5M5 19h14" /></>,
  up: <><path d="m6 14 6-6 6 6" /></>,
  down: <><path d="m6 10 6 6 6-6" /></>,
  bold: <><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" /></>,
  italic: <><path d="M10 5h8M6 19h8M14 5l-4 14" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></>,
  olist: <><path d="M10 6h10M10 12h10M10 18h10M4 5l1-.5V9M4 14h2l-2 3h2" /></>,
  quote: <><path d="M6 17c0-4 1-7 4-9M14 17c0-4 1-7 4-9" /><path d="M5 17h5v-5H5zM13 17h5v-5h-5z" /></>,
  video: <><rect x="3" y="6" width="14" height="12" rx="3" /><path d="m17 10 4-2v8l-4-2z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></>,
  moon: <><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></>,
  burger: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
}

export type AnyIcon = IconName | keyof typeof P

export function Icon({ name, className = 'size-[1.15rem]' }: { name: AnyIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {P[name]}
    </svg>
  )
}
